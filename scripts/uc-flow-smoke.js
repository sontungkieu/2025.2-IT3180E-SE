const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../server/app');

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const dir = mkdtempSync(path.join(tmpdir(), 'ecopark-uc-'));
  const server = createServer({ dbPath: path.join(dir, 'uc.sqlite'), seed: true });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://${address.address}:${address.port}`;
  const browser = await chromium.launch();

  try {
    await verifyGpsDemoConsole(browser, baseUrl);
    await verifyConcurrentDemoSessions(browser, baseUrl);

    const page = await browser.newPage({ viewport: { width: 1366, height: 960 } });
    page.on('pageerror', (error) => {
      throw error;
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await loginDemo(page, 'resident@ecopark.test');
    await page.waitForSelector('.station-map');
    assert.ok(await page.locator('.user-map-pin, .map-user-dot').first().isVisible(), 'user GPS marker is missing');

    await chooseDropdownOption(page, 'location', '[data-location-preset="manual-outside"]');
    await page.waitForSelector('text=Không có bãi xe trong phạm vi đã chọn');
    await chooseDropdownOption(page, 'location', '[data-location-preset="gps-demo"]');
    await page.waitForSelector('[data-rent]:not([disabled])');

    await page.locator('[data-rent]:not([disabled])').first().click();
    await page.waitForSelector('[data-cancel-request]');
    await page.locator('[data-cancel-request]').first().click();
    await page.waitForSelector('text=Đã hủy');

    await page.locator('[data-rent]:not([disabled])').first().click();
    await page.waitForSelector('[data-cancel-request]');

    await logout(page);
    await loginDemo(page, 'staff@ecopark.test');
    const requestRow = page.locator('.requests-table tbody tr').filter({ hasText: 'Tran Minh An' }).first();
    await requestRow.waitFor();
    await requestRow.locator('[data-handover]').click();
    await page.waitForSelector('.active-rentals-table');

    const rentalRow = page.locator('.active-rentals-table tbody tr').filter({ hasText: 'Tran Minh An' }).first();
    await rentalRow.waitFor();
    await rentalRow.locator('select[id^="return-station-"]').selectOption('2');
    await rentalRow.locator('select[id^="condition-"]').selectOption('broken');
    await rentalRow.locator('input[id^="condition-note-"]').fill('Xe trả có tiếng kêu, cần kiểm tra');
    await rentalRow.locator('[data-return]').click();
    await page.waitForSelector('.ticket-panel');
    assert.match(await page.locator('.ticket-panel').innerText(), /TCK\d+/);
    await page.waitForSelector('.report-dashboard .chart-card');
    await page.waitForSelector('.audit-panel .audit-item');
    assert.match(await page.locator('.audit-panel').innerText(), /ECO-/);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#export-report')
    ]);
    assert.ok(download.suggestedFilename().endsWith('.csv'), 'report export did not create a CSV');

    await page.close();
    console.log('uc-flow: /gd demo console, concurrent sessions, customer request/cancel, handover, return ticket and report export passed');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    server.closeDatabase();
    rmSync(dir, { recursive: true, force: true });
  }
}

async function verifyGpsDemoConsole(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(`${baseUrl}/gd`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('.gps-demo-map')?.classList.contains('leaflet-container'));
  await page.waitForSelector('.bike-gps-pin');
  await page.click('[data-gps-snap="far"]');
  await page.waitForSelector('text=Chưa đủ gần bãi đích');
  await page.click('[data-gps-snap="near"]');
  await page.waitForSelector('text=Đủ gần bãi đích');
  assert.equal(await page.locator('.return-step.active').count() >= 3, true, 'GPS demo checklist did not activate route steps');
  const noBodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  assert.equal(noBodyOverflow, true, '/gd demo console has body-level horizontal overflow');
  await page.close();
}

async function verifyConcurrentDemoSessions(browser, baseUrl) {
  const accounts = [
    { email: 'customer@ecopark.test', apiPath: '/api/customer/history' },
    { email: 'resident@ecopark.test', apiPath: '/api/customer/history' },
    { email: 'admin@ecopark.test', apiPath: '/api/admin/reports?period=day' },
    { email: 'admin2@ecopark.test', apiPath: '/api/admin/reports?period=day' }
  ];
  const contexts = await Promise.all(accounts.map(() => browser.newContext({ viewport: { width: 1180, height: 820 } })));
  const gpsContext = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  try {
    const gpsPage = await gpsContext.newPage();
    await gpsPage.goto(`${baseUrl}/gd`, { waitUntil: 'networkidle' });
    await gpsPage.waitForFunction(() => document.querySelector('.gps-demo-map')?.classList.contains('leaflet-container'));
    await gpsPage.waitForSelector('.bike-gps-pin');
    const gpsSessionBefore = await gpsPage.evaluate(() => fetch('/api/session').then((response) => response.json()));
    assert.equal(gpsSessionBefore.user, null, 'GPS operator context should not inherit a login session');

    const pages = await Promise.all(contexts.map((context) => context.newPage()));
    await Promise.all(pages.map(async (page, index) => {
      const account = accounts[index];
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      await loginDemo(page, account.email);
      const session = await page.evaluate(() => fetch('/api/session').then((response) => response.json()));
      assert.equal(session.user.email, account.email);
      const apiStatus = await page.evaluate((pathname) => fetch(pathname).then((response) => response.status), account.apiPath);
      assert.equal(apiStatus, 200, `${account.email} cannot access its role workspace API`);
    }));

    await gpsPage.click('[data-gps-snap="far"]');
    await gpsPage.waitForSelector('text=Chưa đủ gần bãi đích');
    await gpsPage.click('[data-gps-snap="near"]');
    await gpsPage.waitForSelector('text=Đủ gần bãi đích');
    const gpsSessionDuring = await gpsPage.evaluate(() => fetch('/api/session').then((response) => response.json()));
    assert.equal(gpsSessionDuring.user, null, 'GPS operator context should stay independent while demo users are logged in');

    await pages[0].evaluate(() => fetch('/api/auth/logout', { method: 'POST' }));
    const sessions = await Promise.all(pages.map((page) => page.evaluate(() => fetch('/api/session').then((response) => response.json()))));
    assert.equal(sessions[0].user, null);
    assert.equal(sessions[1].user.email, 'resident@ecopark.test');
    assert.equal(sessions[2].user.email, 'admin@ecopark.test');
    assert.equal(sessions[3].user.email, 'admin2@ecopark.test');

    await gpsPage.click('[data-gps-mode="return"]');
    await gpsPage.waitForSelector('text=UC004');
    assert.equal(await gpsPage.locator('.bike-gps-pin').count(), 1, 'GPS operator marker disappeared after concurrent session logout');
  } finally {
    await Promise.all([...contexts, gpsContext].map((context) => context.close()));
  }
}

async function loginDemo(page, email) {
  await page.click(`[data-demo-email="${email}"]`);
  await page.waitForSelector('.dashboard-hero');
}

async function chooseDropdownOption(page, name, optionSelector) {
  await page.click(`[data-select-trigger="${name}"]`);
  await page.waitForSelector(`${optionSelector}:visible`);
  await page.click(optionSelector);
}

async function logout(page) {
  await page.click('#logout');
  await page.waitForSelector('#login-form');
}
