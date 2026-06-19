const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../server/app');

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, demo: 'customer@ecopark.test' },
  { name: 'staff-wide', width: 1600, height: 980, demo: 'staff@ecopark.test' },
  { name: 'staff-medium', width: 1200, height: 900, demo: 'staff@ecopark.test' },
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
  let browser;

  try {
    browser = await chromium.launch();
    for (const viewport of viewports) {
      await verifyViewport(browser, baseUrl, viewport);
    }
  } finally {
    await browser?.close();
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
  const gsapLoaded = await page.evaluate(() => Boolean(window.gsap && window.gsap.timeline));
  await page.waitForSelector('.park-scene-canvas');
  await page.waitForTimeout(500);
  const authCanvas = await canvasStats(page);

  await page.click(`[data-demo-email="${viewport.demo}"]`);
  await page.waitForSelector('.dashboard-hero');
  await page.waitForTimeout(500);
  const appCanvas = await canvasStats(page);
  const mapStats = viewport.demo.includes('customer@') ? await stationMapStats(page) : null;
  const isOperationsViewport = /(?:admin|staff)@/.test(viewport.demo);
  if (isOperationsViewport) {
    await selectWeeklyReport(page);
  }
  const opsTableStats = isOperationsViewport ? await operationsTableStats(page) : null;
  const noBodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  assert.equal(gsapLoaded, true, `${viewport.name} GSAP did not load`);
  assert.ok(authCanvas.nonTransparent > 1000, `${viewport.name} auth canvas is blank`);
  assert.ok(appCanvas.nonTransparent > 1000, `${viewport.name} app canvas is blank`);
  if (mapStats) {
    assert.equal(mapStats.pinCount >= 3, true, `${viewport.name} station map is missing pins`);
    assert.equal(mapStats.realPinCount >= 3, true, `${viewport.name} real map markers are missing`);
    assert.equal(mapStats.mapReady, true, `${viewport.name} station map did not initialize`);
    assert.equal(mapStats.leafletMounted, true, `${viewport.name} Leaflet map did not mount`);
    assert.equal(mapStats.mapOverflow, false, `${viewport.name} station map content overflows`);
  }
  if (opsTableStats) {
    assert.equal(opsTableStats.tableCount >= 3, true, `${viewport.name} operations tables are missing`);
    if (opsTableStats.expectCardRows) {
      assert.equal(opsTableStats.rowsAsCards, true, `${viewport.name} operations rows did not switch to card layout`);
    }
    assert.equal(opsTableStats.tableOverflow, false, `${viewport.name} operations table content overflows`);
    assert.equal(opsTableStats.tableWrapOverflow, false, `${viewport.name} operations table wrapper scrolls horizontally`);
    assert.equal(opsTableStats.reportChartOverflow, false, `${viewport.name} report chart content overflows`);
    assert.equal(opsTableStats.dualChartFullRow, true, `${viewport.name} rental and late-fee chart is squeezed into a narrow column`);
    assert.equal(opsTableStats.reportNativeSelectCount, 0, `${viewport.name} report filters fell back to native selects`);
    assert.equal(opsTableStats.reportSelectCount, 3, `${viewport.name} custom report filters are missing`);
    assert.equal(opsTableStats.weeklyReportSelected, true, `${viewport.name} weekly report custom dropdown did not update state`);
    assert.equal(opsTableStats.reportMoneyScaleAligned, true, `${viewport.name} report money charts use inconsistent scales`);
  }
  assert.equal(noBodyOverflow, true, `${viewport.name} has body-level horizontal overflow`);
  assert.deepEqual(errors, [], `${viewport.name} console errors`);
  console.log(`${viewport.name}: canvas and layout smoke passed`);
  await page.close();
}

async function selectWeeklyReport(page) {
  await page.click('[data-select-trigger="report-period"]');
  await page.waitForFunction(() => document.querySelector('.report-filter-period .pretty-select')?.classList.contains('open'));
  await page.click('[data-report-filter="period"][data-report-value="week"]');
  await page.waitForFunction(() => document.querySelector('.export-state')?.textContent.includes('Theo tuần'));
}

async function operationsTableStats(page) {
  return page.evaluate(() => {
    const tables = [...document.querySelectorAll('.operations-table')];
    const rows = [...document.querySelectorAll('.operations-table tbody tr')];
    const viewportWidth = window.innerWidth;
    const tableOverflow = rows.some((row) => {
      const rect = row.getBoundingClientRect();
      return rect.left < -1 || rect.right > viewportWidth + 1;
    });
    const tableWrapOverflow = [...document.querySelectorAll('.table-wrap')].some((wrap) => wrap.scrollWidth > wrap.clientWidth + 1);
    const reportDashboard = document.querySelector('.report-dashboard');
    const reportBounds = reportDashboard?.getBoundingClientRect();
    const dualChartBounds = reportDashboard?.querySelector('.chart-card:last-child')?.getBoundingClientRect();
    const reportNativeSelectCount = document.querySelectorAll('#report-period, #report-station, #report-bike').length;
    const reportSelectCount = document.querySelectorAll('.report-select').length;
    const weeklyReportSelected = document.querySelector('.export-state')?.textContent.includes('Theo tuần') || false;
    const revenueBars = [...document.querySelectorAll('.revenue-chart .chart-track i')].map((bar) => bar.style.getPropertyValue('--bar'));
    const totalBars = [...document.querySelectorAll('.total-late-chart .dual-bars .total')].map((bar) => bar.style.getPropertyValue('--bar'));
    const reportMoneyScaleAligned = revenueBars.length === 0 || (
      revenueBars.length === totalBars.length
      && revenueBars.every((bar, index) => bar === totalBars[index])
    );
    const reportChartOverflow = reportBounds
      ? [...reportDashboard.querySelectorAll('.chart-card')].some((card) => {
          const rect = card.getBoundingClientRect();
          return rect.left < reportBounds.left - 1 || rect.right > reportBounds.right + 1;
        })
      : false;
    const dualChartFullRow = reportBounds && dualChartBounds
      ? dualChartBounds.width >= reportBounds.width - 1
      : false;
    return {
      tableCount: tables.length,
      expectCardRows: viewportWidth <= 1365,
      rowsAsCards: rows.length > 0 && rows.every((row) => getComputedStyle(row).display === 'grid'),
      tableOverflow,
      tableWrapOverflow,
      reportChartOverflow,
      dualChartFullRow,
      reportNativeSelectCount,
      reportSelectCount,
      weeklyReportSelected,
      reportMoneyScaleAligned
    };
  });
}

async function stationMapStats(page) {
  return page.evaluate(() => {
    const map = document.querySelector('.station-map');
    const leaflet = document.querySelector('.leaflet-station-map');
    const realPins = [...document.querySelectorAll('.real-map-pin')];
    const fallbackPins = [...document.querySelectorAll('.map-pin')];
    const mapRect = map.getBoundingClientRect();
    const visiblePins = realPins.length ? realPins : fallbackPins;
    const mapOverflow = visiblePins.some((pin) => {
      const rect = pin.getBoundingClientRect();
      return rect.left < mapRect.left - 1 || rect.right > mapRect.right + 1 || rect.top < mapRect.top - 1 || rect.bottom > mapRect.bottom + 1;
    });
    return {
      pinCount: visiblePins.length,
      realPinCount: realPins.length,
      mapReady: map.classList.contains('map-ready'),
      leafletMounted: Boolean(leaflet && leaflet.querySelector('.leaflet-pane')),
      mapOverflow
    };
  });
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
