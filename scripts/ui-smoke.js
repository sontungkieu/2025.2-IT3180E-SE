const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../server/app');

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, demo: 'customer@ecopark.test' },
  { name: 'mobile', width: 390, height: 844, demo: 'admin@ecopark.test' }
];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const dir = mkdtempSync(path.join(tmpdir(), 'ecopark-ui-'));
  const server = createServer({ dbPath: path.join(dir, 'ui.sqlite'), seed: true });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://${address.address}:${address.port}`;

  try {
    const browser = await chromium.launch();
    for (const viewport of viewports) {
      await verifyViewport(browser, baseUrl, viewport);
    }
    await browser.close();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    server.closeDatabase();
    rmSync(dir, { recursive: true, force: true });
  }
}

async function verifyViewport(browser, baseUrl, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('.park-scene-canvas');
  await page.waitForTimeout(500);
  const authCanvas = await canvasStats(page);

  await page.click(`[data-demo-email="${viewport.demo}"]`);
  await page.waitForSelector('.dashboard-hero');
  await page.waitForTimeout(500);
  const appCanvas = await canvasStats(page);
  const noBodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  assert.ok(authCanvas.nonTransparent > 1000, `${viewport.name} auth canvas is blank`);
  assert.ok(appCanvas.nonTransparent > 1000, `${viewport.name} app canvas is blank`);
  assert.equal(noBodyOverflow, true, `${viewport.name} has body-level horizontal overflow`);
  assert.deepEqual(errors, [], `${viewport.name} console errors`);
  console.log(`${viewport.name}: canvas and layout smoke passed`);
  await page.close();
}

async function canvasStats(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.park-scene-canvas');
    const sample = document.createElement('canvas');
    sample.width = canvas.width;
    sample.height = canvas.height;
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(canvas, 0, 0);
    const data = context.getImageData(0, 0, sample.width, sample.height).data;
    let nonTransparent = 0;
    for (let i = 0; i < data.length; i += 16) {
      if (data[i + 3] > 8) nonTransparent += 1;
    }
    return { width: sample.width, height: sample.height, nonTransparent };
  });
}
