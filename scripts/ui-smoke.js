const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../server/app');

const viewports = [
  { name: 'customer-desktop', width: 1440, height: 1000, demo: 'customer@ecopark.test' },
  { name: 'customer-mobile', width: 390, height: 844, demo: 'customer@ecopark.test' },
  { name: 'staff-wide', width: 1600, height: 980, demo: 'staff@ecopark.test' },
  { name: 'staff-medium', width: 1200, height: 900, demo: 'staff@ecopark.test' },
  { name: 'admin-mobile', width: 390, height: 844, demo: 'admin@ecopark.test' }
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
    await verifyGpsDemoMobile(browser, baseUrl);
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
  const isCustomerViewport = viewport.demo.includes('customer@');
  const mapStats = isCustomerViewport ? await stationMapStats(page) : null;
  const isOperationsViewport = /(?:admin|staff)@/.test(viewport.demo);
  if (isOperationsViewport) {
    await selectWeeklyReport(page);
  }
  const customerFilterState = isCustomerViewport ? await customerFilterStats(page) : null;
  const mobileRailStats = viewport.name === 'customer-mobile' ? await mobileDropdownRailStats(page) : null;
  const customerRailStats = isCustomerViewport ? await customerRailSelectionStats(page) : null;
  const opsTableStats = isOperationsViewport ? await operationsTableStats(page) : null;
  const noBodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  assert.equal(gsapLoaded, true, `${viewport.name} GSAP did not load`);
  assert.ok(authCanvas.nonTransparent > 1000, `${viewport.name} auth canvas is blank`);
  assert.ok(appCanvas.nonTransparent > 1000, `${viewport.name} app canvas is blank`);
  if (viewport.name === 'staff-medium') {
    assert.ok(
      appCanvas.occupiedWidthRatio >= 0.55,
      `${viewport.name} scene is compressed into a thumbnail: ${JSON.stringify(appCanvas)}`
    );
  }
  if (mapStats) {
    assert.equal(mapStats.pinCount >= 3, true, `${viewport.name} station map is missing pins`);
    assert.equal(mapStats.realPinCount >= 3, true, `${viewport.name} real map markers are missing`);
    assert.equal(mapStats.mapReady, true, `${viewport.name} station map did not initialize`);
    assert.equal(mapStats.leafletMounted, true, `${viewport.name} Leaflet map did not mount`);
    assert.equal(mapStats.mapOverflow, false, `${viewport.name} station map content overflows`);
  }
  if (customerFilterState) {
    assert.equal(
      customerFilterState.springParkMetaIncludesTypeCount,
      true,
      `${viewport.name} station card does not show type-specific counts: ${JSON.stringify(customerFilterState)}`
    );
    assert.deepEqual(
      customerFilterState.rangeLabels,
      ['200 m', '500 m', '1 km'],
      `${viewport.name} customer range options are not scaled for nearby stations`
    );
    assert.equal(customerFilterState.visibleControlLabelCount, 0, `${viewport.name} customer filter labels should not render above dropdowns`);
    assert.equal(customerFilterState.gpsCopyUsesDemoWord, false, `${viewport.name} customer map GPS copy still includes demo wording`);
  }
  if (customerRailStats) {
    assert.equal(
      customerRailStats.rentalsActive,
      true,
      `${viewport.name} rental history rail item did not become active: ${JSON.stringify(customerRailStats)}`
    );
    assert.equal(
      customerRailStats.rentActive,
      false,
      `${viewport.name} rent rail item stayed active after selecting rental history: ${JSON.stringify(customerRailStats)}`
    );
  }
  if (mobileRailStats) {
    assert.equal(mobileRailStats.railVisible, true, `${viewport.name} bottom rail is not visible`);
    assert.equal(
      mobileRailStats.railTopmost,
      true,
      `${viewport.name} bottom rail is covered while dropdown is open: ${JSON.stringify(mobileRailStats)}`
    );
    assert.equal(
      mobileRailStats.menuClearOfRail,
      true,
      `${viewport.name} dropdown menu overlaps the bottom rail: ${JSON.stringify(mobileRailStats)}`
    );
    assert.equal(
      mobileRailStats.toastClearOfRail,
      true,
      `${viewport.name} toast overlaps the bottom rail: ${JSON.stringify(mobileRailStats)}`
    );
    assert.equal(
      mobileRailStats.toastTopAnchored,
      true,
      `${viewport.name} toast is not anchored near the top on mobile: ${JSON.stringify(mobileRailStats)}`
    );
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

async function verifyGpsDemoMobile(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/gd`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.gps-user-grid .gps-chip');
  const stats = await page.evaluate(() => {
    const chips = [...document.querySelectorAll('.gps-user-grid .gps-chip')];
    return {
      chipCount: chips.length,
      overflowingChipCount: chips.filter((chip) => chip.scrollHeight > chip.clientHeight + 1).length,
      bodyOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  });

  assert.ok(stats.chipCount >= 1, 'gps-mobile user account chips are missing');
  assert.equal(stats.overflowingChipCount, 0, `gps-mobile account metadata is clipped: ${JSON.stringify(stats)}`);
  assert.equal(stats.bodyOverflow, false, 'gps-mobile has body-level horizontal overflow');
  assert.deepEqual(errors, [], 'gps-mobile console errors');
  console.log('gps-mobile: account chip layout smoke passed');
  await page.close();
}

async function selectWeeklyReport(page) {
  await page.click('[data-select-trigger="report-period"]');
  await page.waitForFunction(() => document.querySelector('.report-filter-period .pretty-select')?.classList.contains('open'));
  await page.click('[data-report-filter="period"][data-report-value="week"]');
  await page.waitForFunction(() => document.querySelector('.export-state')?.textContent.includes('Theo tuần'));
}

async function mobileDropdownRailStats(page) {
  await page.click('[data-select-trigger="type"]');
  await page.waitForFunction(() => document.querySelector('.select-group-type .pretty-select')?.classList.contains('open'));
  await page.waitForTimeout(100);
  const stats = await page.evaluate(() => {
    const rail = document.querySelector('.command-rail');
    const menu = document.querySelector('.select-group-type .pretty-select-menu');
    const toast = document.querySelector('.toast');
    const railRect = rail?.getBoundingClientRect();
    const menuRect = menu?.getBoundingClientRect();
    const toastRect = toast?.getBoundingClientRect();
    const point = railRect
      ? { x: Math.round((railRect.left + railRect.right) / 2), y: Math.round((railRect.top + railRect.bottom) / 2) }
      : { x: Math.round(window.innerWidth / 2), y: window.innerHeight - 36 };
    const topElement = document.elementFromPoint(point.x, point.y);
    const railVisible = Boolean(rail && getComputedStyle(rail).display !== 'none' && getComputedStyle(rail).visibility !== 'hidden');
    const railTopmost = Boolean(topElement?.closest('.command-rail'));
    const menuClearOfRail = Boolean(!railRect || !menuRect || menuRect.bottom <= railRect.top - 4);
    const toastShown = toast?.classList.contains('show') || false;
    const toastClearOfRail = Boolean(!toastShown || !railRect || !toastRect || toastRect.bottom <= railRect.top - 4 || toastRect.top >= railRect.bottom + 4);
    const toastTopAnchored = Boolean(!toastShown || !toastRect || toastRect.top <= 64);
    return {
      railVisible,
      railTopmost,
      menuClearOfRail,
      toastClearOfRail,
      toastTopAnchored,
      railRect: railRect ? { top: railRect.top, bottom: railRect.bottom } : null,
      menuRect: menuRect ? { top: menuRect.top, bottom: menuRect.bottom } : null,
      toastRect: toastRect ? { top: toastRect.top, bottom: toastRect.bottom } : null,
      toastShown,
      topElementClass: topElement?.className ? String(topElement.className) : topElement?.tagName || null,
      point
    };
  });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.select-group-type .pretty-select')?.classList.contains('open'));
  return stats;
}

async function customerFilterStats(page) {
  await page.click('[data-select-trigger="type"]');
  await page.waitForSelector('[data-type-filter="3"]:visible');
  await page.click('[data-type-filter="3"]');
  await page.waitForFunction(() => {
    const springPark = [...document.querySelectorAll('.station-card')].find((card) => card.textContent.includes('Spring Park Gate'));
    return springPark?.textContent.includes('Child-seat · 0/1 xe rảnh');
  });
  return page.evaluate(() => {
    const springPark = [...document.querySelectorAll('.station-card')].find((card) => card.textContent.includes('Spring Park Gate'));
    const rangeLabels = [...document.querySelectorAll('[data-station-range] .select-option-copy strong')].map((node) => node.textContent.trim());
    const gpsCopy = document.querySelector('.map-status-chip')?.textContent || '';
    return {
      springParkText: springPark?.textContent.replace(/\s+/g, ' ').trim() || '',
      springParkMetaIncludesTypeCount: springPark?.textContent.includes('Child-seat · 0/1 xe rảnh') || false,
      rangeLabels,
      visibleControlLabelCount: document.querySelectorAll('.search-workflow .control-label').length,
      gpsCopyUsesDemoWord: /\bdemo\b/i.test(gpsCopy)
    };
  });
}

async function customerRailSelectionStats(page) {
  await page.click('[data-rail-target="workspace-rentals"]');
  await page.waitForFunction(() => document.querySelector('[data-rail-target="workspace-rentals"]')?.classList.contains('active'));
  return page.evaluate(() => {
    const rent = document.querySelector('[data-rail-target="workspace-rent"]');
    const rentals = document.querySelector('[data-rail-target="workspace-rentals"]');
    const rentalsRect = document.querySelector('#workspace-rentals')?.getBoundingClientRect();
    return {
      rentActive: rent?.classList.contains('active') || false,
      rentalsActive: rentals?.classList.contains('active') || false,
      rentalsCurrent: rentals?.getAttribute('aria-current') || null,
      rentalsRect: rentalsRect ? { top: rentalsRect.top, bottom: rentalsRect.bottom } : null
    };
  });
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
    let minX = sample.width;
    let maxX = -1;
    for (let y = 0; y < sample.height; y += 2) {
      for (let x = 0; x < sample.width; x += 2) {
        const alpha = data[(y * sample.width + x) * 4 + 3];
        if (alpha <= 8) continue;
        nonTransparent += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    const occupiedWidthRatio = maxX >= minX
      ? (maxX - minX + 2) / sample.width
      : 0;
    return { width: sample.width, height: sample.height, nonTransparent, occupiedWidthRatio };
  });
}
