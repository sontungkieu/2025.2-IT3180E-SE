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
    const page = await browser.newPage({ viewport: { width: 1366, height: 960 } });
    page.on('pageerror', (error) => {
      throw error;
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await loginDemo(page, 'resident@ecopark.test');
    await page.waitForSelector('.station-map');
    assert.ok(await page.locator('.user-map-pin, .map-user-dot').first().isVisible(), 'user GPS marker is missing');

    await page.selectOption('#location-preset', 'manual-outside');
    await page.waitForSelector('text=Không có bãi xe trong phạm vi đã chọn');
    await page.selectOption('#location-preset', 'gps-demo');
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
    await rentalRow.locator('select[id^="return-station-"]').selectOption('1');
    await rentalRow.locator('select[id^="condition-"]').selectOption('broken');
    await rentalRow.locator('input[id^="condition-note-"]').fill('Xe trả có tiếng kêu, cần kiểm tra');
    await rentalRow.locator('[data-return]').click();
    await page.waitForSelector('.ticket-panel');
    assert.match(await page.locator('.ticket-panel').innerText(), /TCK\d+/);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#export-report')
    ]);
    assert.ok(download.suggestedFilename().endsWith('.csv'), 'report export did not create a CSV');

    await page.close();
    console.log('uc-flow: customer request/cancel, handover, return ticket, GPS marker and report export passed');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    server.closeDatabase();
    rmSync(dir, { recursive: true, force: true });
  }
}

async function loginDemo(page, email) {
  await page.click(`[data-demo-email="${email}"]`);
  await page.waitForSelector('.dashboard-hero');
}

async function logout(page) {
  await page.click('#logout');
  await page.waitForSelector('#login-form');
}
