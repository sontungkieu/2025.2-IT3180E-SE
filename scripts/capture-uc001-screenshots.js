const { mkdirSync, mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../server/app');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'pdf', 'assets', 'uc001_flow');

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const dir = mkdtempSync(path.join(tmpdir(), 'ecopark-uc001-capture-'));
  const server = createServer({ dbPath: path.join(dir, 'uc001.sqlite'), seed: true });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://${address.address}:${address.port}`;
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      viewport: { width: 1366, height: 960 },
      reducedMotion: 'reduce'
    });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#register-form');
    await page.locator('#register-form').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await screenshotForm(page, 'uc001_01_register_form.png');

    await page.fill('#register-form input[name="fullName"]', 'Le Minh Thu');
    await page.fill('#register-form input[name="email"]', '');
    await page.fill('#register-form input[name="phone"]', '');
    await page.fill('#register-form input[name="password"]', 'valid123');
    await page.fill('#register-form input[name="identityNumber"]', '');
    await page.fill('#register-form input[name="address"]', '');
    await page.locator('#register-form button[type="submit"]').click();
    await page.waitForSelector('text=Vui lòng nhập email hợp lệ.');
    await page.waitForTimeout(200);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'uc001_02_missing_required_fields.png'),
      fullPage: false
    });

    await page.fill('#register-form input[name="email"]', 'uc001.capture@ecopark.test');
    await page.fill('#register-form input[name="phone"]', '0912345678');
    await page.fill('#register-form input[name="identityNumber"]', '001203888777');
    await page.fill('#register-form input[name="address"]', 'Park River, Ecopark');
    await page.locator('#register-form button[type="submit"]').click();
    await page.waitForSelector('#workspace-account');
    await page.click('[data-rail-target="workspace-account"]');
    await scrollToAccountPanel(page);
    await page.waitForTimeout(350);
    await screenshotPanel(page, 'uc001_03_account_created_unverified.png');

    await page.click('#request-email-code');
    await page.waitForSelector('#email-verify-form input[name="code"]');
    await scrollToAccountPanel(page);
    await page.waitForTimeout(300);
    await screenshotPanel(page, 'uc001_04_email_code_ready.png');

    await page.locator('#email-verify-form button[type="submit"]').click();
    await page.waitForFunction(() => {
      const account = document.querySelector('#workspace-account');
      return account && !document.querySelector('#email-verify-form') && account.textContent.includes('Đã xác minh');
    });
    await scrollToAccountPanel(page);
    await page.waitForTimeout(300);
    await screenshotPanel(page, 'uc001_05_email_verified.png');

    await page.close();
    console.log(`UC001 screenshots written to ${path.relative(ROOT_DIR, OUTPUT_DIR)}`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    server.closeDatabase();
    rmSync(dir, { recursive: true, force: true });
  }
}

async function screenshotForm(page, filename) {
  await page.locator('#register-form').screenshot({
    path: path.join(OUTPUT_DIR, filename)
  });
}

async function scrollToAccountPanel(page) {
  await page.evaluate(() => document.querySelector('#workspace-account')?.scrollIntoView({ block: 'start' }));
}

async function screenshotPanel(page, filename) {
  await page.locator('#workspace-account').screenshot({
    path: path.join(OUTPUT_DIR, filename)
  });
}
