import { mountScene } from '/scene.js';

const LOCATION_PRESETS = [
  { id: 'gps-demo', label: 'GPS demo - Ecopark Center', mode: 'gps', lat: 20.9491, lng: 105.9346 },
  { id: 'manual-green-bay', label: 'Nhập tay - Green Bay', mode: 'manual', lat: 20.9536, lng: 105.9329 },
  { id: 'manual-aqua-bay', label: 'Nhập tay - Aqua Bay', mode: 'manual', lat: 20.9468, lng: 105.9327 },
  { id: 'manual-outside', label: 'Nhập tay - ngoài phạm vi', mode: 'manual', lat: 20.9918, lng: 105.8784 }
];

const state = {
  user: null,
  stations: [],
  bikeTypes: [],
  selectedStationId: null,
  selectedTypeId: '',
  locationPresetId: 'gps-demo',
  stationRangeKm: 3,
  stationBikes: [],
  history: { pendingRequests: [], activeRentals: [], completedRentals: [], archivedRequests: [] },
  pendingRequests: [],
  activeRentals: [],
  fleet: [],
  fleetQuery: '',
  reports: null,
  reportPeriod: 'day',
  reportStationId: '',
  reportBikeId: '',
  lastTicket: null
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const gsap = window.gsap;
let stationMapInstance = null;
let motionContext = null;
let currentView = null;
let toastTween = null;

init();

async function init() {
  try {
    const session = await api('/api/session');
    state.user = session.user;
    await refreshData();
  } catch (error) {
    notify(error.message, true);
  }
  render();
}

async function refreshData() {
  const searchLocation = currentLocation();
  state.bikeTypes = (await api('/api/bike-types')).bikeTypes;
  const stationResults = (await api(`/api/stations?lat=${searchLocation.lat}&lng=${searchLocation.lng}`)).stations;
  state.stations = state.user?.role === 'customer'
    ? stationResults.filter((station) => Number(station.distance_km || 0) <= state.stationRangeKm)
    : stationResults;
  if (state.selectedStationId && !state.stations.some((station) => station.station_id === state.selectedStationId)) {
    state.selectedStationId = null;
  }
  if (!state.selectedStationId && state.stations.length) {
    state.selectedStationId = state.stations[0].station_id;
  }

  if (!state.user) return;

  if (state.user.role === 'customer') {
    state.history = { pendingRequests: [], activeRentals: [], completedRentals: [], archivedRequests: [], ...await api('/api/customer/history') };
    await loadStationBikes();
  } else {
    state.pendingRequests = (await api('/api/staff/pending-requests')).requests;
    state.activeRentals = (await api('/api/staff/active-rentals')).rentals;
    state.fleet = (await api('/api/admin/bikes')).bikes;
    const reportParams = new URLSearchParams({ period: state.reportPeriod });
    if (state.reportStationId) reportParams.set('stationId', state.reportStationId);
    if (state.reportBikeId) reportParams.set('bikeId', state.reportBikeId);
    state.reports = await api(`/api/admin/reports?${reportParams}`);
  }
}

async function loadStationBikes() {
  if (!state.selectedStationId) {
    state.stationBikes = [];
    return;
  }
  const type = state.selectedTypeId ? `&typeId=${state.selectedTypeId}` : '';
  state.stationBikes = (await api(`/api/stations/${state.selectedStationId}/bikes?${type}`)).bikes;
}

function render() {
  clearPageMotion();
  disposeStationMap();
  const nextView = !state.user ? 'auth' : state.user.role === 'customer' ? 'customer' : 'operations';
  const isViewSwitch = currentView !== nextView;
  currentView = nextView;
  app.className = `app-root view-${nextView}`;

  if (!state.user) {
    app.innerHTML = authView();
    resetScrollOnViewSwitch(isViewSwitch);
    bindAuthEvents();
    mountScene(document.querySelector('#scene'));
    runPageMotion(nextView, isViewSwitch);
    return;
  }

  app.innerHTML = shellView();
  resetScrollOnViewSwitch(isViewSwitch);
  bindAppEvents();
  mountScene(document.querySelector('#scene'));
  if (state.user.role === 'customer') {
    mountStationMap();
  }
  runPageMotion(nextView, isViewSwitch);
}

function authView() {
  return `
    <main class="auth-layout">
      <section class="auth-copy">
        <div class="brand-row">
          <span class="brand-mark"><img src="/vendor/icons/bike.svg" alt=""></span>
          <div>
            <strong>Ecopark Bicycle Parking</strong>
            <span>Thuê - trả xe đạp Ecopark</span>
          </div>
        </div>
        <h1>Điều phối thuê - trả xe đạp Ecopark trong một bảng vận hành.</h1>
        <p>Theo dõi bãi xe, yêu cầu nhận xe, lượt thuê và báo cáo từ cùng một hệ thống cục bộ.</p>
        <div class="auth-highlights" aria-label="Tóm tắt nghiệp vụ">
          ${highlight('id-card', 'CCCD + cọc 200k')}
          ${highlight('percent', 'Cư dân giảm 40%')}
          ${highlight('bar-chart-3', 'Báo cáo theo kỳ')}
        </div>
        <div id="scene" class="scene auth-scene" aria-hidden="true"></div>
      </section>
      <section class="auth-panel">
        <div class="auth-panel-header">
          <div>
            <p class="eyebrow">Workspace</p>
            <h2>Đăng nhập</h2>
          </div>
          <span class="status-pill ok">Local demo</span>
        </div>
        <form id="login-form" class="form-grid">
          <label>Email<input name="email" type="email" value="customer@ecopark.test" autocomplete="username" required></label>
          <label>Mật khẩu<input name="password" type="password" value="customer123" autocomplete="current-password" required></label>
          <button class="primary" type="submit"><img src="/vendor/icons/log-in.svg" alt="">Đăng nhập</button>
        </form>
        <div class="demo-grid">
          ${demoButton('customer@ecopark.test', 'customer123', 'Khách thường')}
          ${demoButton('resident@ecopark.test', 'resident123', 'Cư dân')}
          ${demoButton('staff@ecopark.test', 'staff123', 'Nhân sự bãi')}
          ${demoButton('admin@ecopark.test', 'admin123', 'Admin')}
        </div>
        <hr>
        <form id="register-form" class="form-grid compact">
          <h2>Tạo tài khoản khách</h2>
          <label>Họ tên<input name="fullName" autocomplete="name" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Số điện thoại<input name="phone" autocomplete="tel" required></label>
          <label>Mật khẩu<input name="password" type="password" minlength="6" autocomplete="new-password" required></label>
          <label>CCCD/CMND<input name="identityNumber" autocomplete="off" required></label>
          <label>Địa chỉ<input name="address" autocomplete="street-address" required></label>
          <label>Loại khách
            <select name="customerType">
              <option value="visitor">Khách thường</option>
              <option value="resident">Cư dân Ecopark</option>
            </select>
          </label>
          <label>Thẻ cư dân<input name="residentCardNumber"></label>
          <button class="secondary" type="submit"><img src="/vendor/icons/user-plus.svg" alt="">Tạo tài khoản</button>
        </form>
      </section>
    </main>
  `;
}

function shellView() {
  const isCustomer = state.user.role === 'customer';
  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand-row">
          <span class="brand-mark"><img src="/vendor/icons/bike.svg" alt=""></span>
          <div>
            <strong>Ecopark Bicycle Parking</strong>
            <span>${roleLabel(state.user.role)}</span>
          </div>
        </div>
        <div class="user-actions">
          <span>${escapeHtml(state.user.full_name)}</span>
          <button id="refresh" class="icon-button" type="button" title="Làm mới" aria-label="Làm mới dữ liệu"><img src="/vendor/icons/refresh-cw.svg" alt=""></button>
          <button id="logout" class="ghost" type="button"><img src="/vendor/icons/log-out.svg" alt="">Đăng xuất</button>
        </div>
      </header>
      <section class="dashboard-hero">
        <div class="hero-copy">
          <p class="eyebrow">${isCustomer ? 'Customer workspace' : 'Operations workspace'}</p>
          <h1>${isCustomer ? 'Tìm bãi gần nhất, chọn xe rảnh và theo dõi lượt thuê.' : 'Xử lý nhận xe, trả xe, đội xe và thống kê tập trung.'}</h1>
          <div class="metric-strip">
            ${metric('Bãi hoạt động', state.stations.filter((s) => s.station_status === 'active').length, 'map-pin')}
            ${metric('Xe sẵn sàng', state.stations.reduce((sum, s) => sum + Number(s.available_bikes || 0), 0), 'bike')}
            ${metric(isCustomer ? 'Lượt đã lưu' : 'Yêu cầu chờ', isCustomer ? state.history.completedRentals.length : state.pendingRequests.length, isCustomer ? 'history' : 'clipboard-check')}
          </div>
        </div>
        <div id="scene" class="scene hero-scene" aria-hidden="true"></div>
      </section>
      ${isCustomer ? customerView() : operationsView()}
    </div>
  `;
}

function customerView() {
  return `
    <main class="content-grid customer-grid">
      <section class="panel account-panel">
        <div class="section-heading">
          <h2>Tài khoản</h2>
          <span class="status-pill ${state.user.profile.discount_eligible ? 'ok' : ''}">${state.user.profile.customer_type === 'resident' ? 'Resident' : 'Visitor'}</span>
        </div>
        <dl class="detail-list">
          <div><dt>Email</dt><dd>${escapeHtml(state.user.email)}</dd></div>
          <div><dt>CCCD</dt><dd>${escapeHtml(state.user.profile.identity_number)}</dd></div>
          <div><dt>Giảm cư dân</dt><dd>${state.user.profile.discount_eligible ? 'Đang áp dụng 40%' : 'Chưa áp dụng'}</dd></div>
        </dl>
        <form id="resident-form" class="form-grid compact">
          <h3>Bổ sung thẻ cư dân</h3>
          <label>Địa chỉ Ecopark<input name="address" value="${escapeAttr(state.user.profile.address)}" required></label>
          <label>Số thẻ cư dân<input name="cardNumber" value="${escapeAttr(state.user.profile.card_number || '')}" required></label>
          <button class="secondary" type="submit"><img src="/vendor/icons/badge-check.svg" alt="">Lưu thẻ</button>
        </form>
      </section>
      <section class="panel stations-panel">
        <div class="section-heading">
          <h2>Bãi xe gần bạn</h2>
          <select id="type-filter" aria-label="Lọc loại xe">
            <option value="">Tất cả loại xe</option>
            ${state.bikeTypes.map((type) => `<option value="${type.bike_type_id}" ${String(type.bike_type_id) === String(state.selectedTypeId) ? 'selected' : ''}>${escapeHtml(type.type_name)}</option>`).join('')}
          </select>
        </div>
        ${stationSearchControls()}
        ${stationMapView()}
        <div class="station-grid">${state.stations.map(stationCard).join('') || emptyState('Không có bãi xe trong phạm vi đã chọn')}</div>
      </section>
      <section class="panel bikes-panel">
        <div class="section-heading">
          <h2>Xe tại bãi đã chọn</h2>
          <span>${selectedStationName()}</span>
        </div>
        <div class="bike-grid">${state.stationBikes.map(bikeCard).join('') || emptyState('Không có xe phù hợp')}</div>
      </section>
      <section class="panel history-panel">
        <div class="section-heading">
          <h2>Lịch sử thuê</h2>
          <span>${state.history.completedRentals.length} lượt</span>
        </div>
        ${customerActivity()}
      </section>
    </main>
  `;
}

function operationsView() {
  return `
    <main class="content-grid ops-grid">
      <section class="panel report-panel">
        <div class="section-heading">
          <h2>Thống kê</h2>
          <button id="export-report" class="secondary small" type="button"><img src="/vendor/icons/file-down.svg" alt="">Xuất CSV</button>
        </div>
        ${reportFilters()}
        ${reportView()}
      </section>
      <section class="panel pending-panel">
        <div class="section-heading">
          <h2>Yêu cầu nhận xe</h2>
          <span>${state.pendingRequests.length} pending</span>
        </div>
        ${pendingRequestsTable()}
      </section>
      <section class="panel active-panel">
        <div class="section-heading">
          <h2>Xe đang thuê</h2>
          <span>${state.activeRentals.length} lượt</span>
        </div>
        ${activeRentalsTable()}
      </section>
      ${state.lastTicket ? ticketPanel() : ''}
      <section class="panel fleet-panel">
        <div class="section-heading">
          <h2>Đội xe</h2>
          <span>${state.fleet.length} xe</span>
        </div>
        ${fleetControls()}
        ${fleetTable()}
      </section>
      ${state.user.role === 'admin' ? adminForms() : ''}
    </main>
  `;
}

function stationSearchControls() {
  const selected = currentLocation();
  return `
    <div class="flow-controls location-controls" aria-label="Điều kiện tìm bãi">
      <label>Vị trí tìm kiếm
        <select id="location-preset">
          ${LOCATION_PRESETS.map((preset) => `<option value="${preset.id}" ${preset.id === state.locationPresetId ? 'selected' : ''}>${escapeHtml(preset.label)}</option>`).join('')}
        </select>
      </label>
      <label>Phạm vi
        <select id="station-range">
          ${[1, 3, 5, 10].map((range) => `<option value="${range}" ${Number(state.stationRangeKm) === range ? 'selected' : ''}>${range} km</option>`).join('')}
        </select>
      </label>
      <span class="flow-note ${selected.mode === 'gps' ? 'ok' : ''}">
        <img src="/vendor/icons/${selected.mode === 'gps' ? 'locate-fixed' : 'map-pinned'}.svg" alt="">
        ${selected.mode === 'gps' ? 'GPS demo đang bật' : 'Đang dùng vị trí nhập tay'}
      </span>
    </div>
  `;
}

function reportFilters() {
  return `
    <div class="flow-controls report-controls" aria-label="Bộ lọc báo cáo">
      <label>Kỳ báo cáo
        <select id="report-period">
          <option value="day" ${state.reportPeriod === 'day' ? 'selected' : ''}>Ngày</option>
          <option value="week" ${state.reportPeriod === 'week' ? 'selected' : ''}>Tuần</option>
          <option value="month" ${state.reportPeriod === 'month' ? 'selected' : ''}>Tháng</option>
        </select>
      </label>
      <label>Bãi xe
        <select id="report-station">
          <option value="">Tất cả bãi</option>
          ${state.stations.map((station) => `<option value="${station.station_id}" ${String(station.station_id) === String(state.reportStationId) ? 'selected' : ''}>${escapeHtml(station.station_name)}</option>`).join('')}
        </select>
      </label>
      <label>Xe
        <select id="report-bike">
          <option value="">Tất cả xe</option>
          ${state.fleet.map((bike) => `<option value="${bike.bike_id}" ${String(bike.bike_id) === String(state.reportBikeId) ? 'selected' : ''}>${escapeHtml(bike.bike_code)}</option>`).join('')}
        </select>
      </label>
    </div>
  `;
}

function fleetControls() {
  return `
    <div class="flow-controls fleet-controls" aria-label="Tra cứu đội xe">
      <label>Tìm xe
        <input id="fleet-search" value="${escapeAttr(state.fleetQuery)}" placeholder="Mã xe, loại, bãi hoặc trạng thái">
      </label>
      <span class="flow-note">
        <img src="/vendor/icons/search.svg" alt="">
        ${filteredFleet().length}/${state.fleet.length} xe khớp
      </span>
    </div>
  `;
}

function ticketPanel() {
  const ticket = state.lastTicket;
  return `
    <section class="panel ticket-panel">
      <div class="section-heading">
        <h2>Phiếu vừa xuất</h2>
        <span>TCK${ticket.ticket_id}</span>
      </div>
      <div class="ticket-summary">
        ${metric('Phí thuê', money(ticket.base_fee), 'banknote')}
        ${metric('Giảm cư dân', money(ticket.resident_discount_amount), 'percent')}
        ${metric('Phụ thu', money(ticket.late_fee), 'timer')}
        ${metric('Tổng thu', money(ticket.total_amount), 'receipt-text')}
      </div>
      <dl class="detail-list inline-details">
        <div><dt>Xe</dt><dd>${escapeHtml(ticket.bike_code)}</dd></div>
        <div><dt>Bãi trả</dt><dd>${escapeHtml(ticket.return_station)}</dd></div>
        <div><dt>Thời điểm</dt><dd>${formatTime(ticket.issued_at)}</dd></div>
      </dl>
    </section>
  `;
}

function currentLocation() {
  return LOCATION_PRESETS.find((preset) => preset.id === state.locationPresetId) || LOCATION_PRESETS[0];
}

function stationCard(station) {
  const active = station.station_id === state.selectedStationId ? 'active' : '';
  return `
    <button class="station-card ${active}" type="button" data-station="${station.station_id}">
      <span class="station-title">${escapeHtml(station.station_name)}</span>
      <span>${escapeHtml(station.address)}</span>
      <span class="station-meta">${station.distance_km ?? '-'} km · ${station.available_bikes || 0}/${station.total_bikes || 0} xe rảnh</span>
    </button>
  `;
}

function stationMapView() {
  if (!state.stations.length) return emptyState('Chưa có bãi xe');
  return `
    <div class="station-map" aria-label="Bản đồ bãi xe Ecopark">
      <div class="map-fallback" aria-hidden="true">
        ${fallbackMapView()}
      </div>
      <div id="station-map-real" class="leaflet-station-map"></div>
    </div>
  `;
}

function fallbackMapView() {
  const points = stationMapFallbackPoints();
  return `
    <div class="map-zone zone-one"></div>
    <div class="map-zone zone-two"></div>
    <div class="map-lake"></div>
    <div class="map-route route-main"></div>
    <div class="map-route route-branch"></div>
    <span class="map-user-dot" style="--x:${points.user.x}%; --y:${points.user.y}%"><span>Bạn</span></span>
    ${points.stations.map(({ station, x, y }) => mapPin(station, x, y)).join('')}
  `;
}

function stationMapFallbackPoints() {
  const userLocation = currentLocation();
  const lats = [...state.stations.map((station) => Number(station.latitude)), userLocation.lat];
  const lngs = [...state.stations.map((station) => Number(station.longitude)), userLocation.lng];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const project = (lat, lng) => ({
    x: 14 + ((Number(lng) - minLng) / lngRange) * 72,
    y: 14 + (1 - ((Number(lat) - minLat) / latRange)) * 72
  });

  return {
    user: project(userLocation.lat, userLocation.lng),
    stations: state.stations.map((station) => ({ station, ...project(station.latitude, station.longitude) }))
  };
}

function mapPin(station, x, y) {
  const active = station.station_id === state.selectedStationId ? 'active' : '';
  const side = x > 60 ? 'side-left' : 'side-right';
  return `
    <button class="map-pin ${active} ${side}" type="button" style="--x:${x}%; --y:${y}%" data-station="${station.station_id}">
      <span class="pin-dot"></span>
      <span class="pin-label">
        <strong>${escapeHtml(station.station_name)}</strong>
        <small>${station.available_bikes || 0} xe rảnh</small>
      </span>
    </button>
  `;
}

function mountStationMap() {
  const container = document.querySelector('#station-map-real');
  if (!container || !window.L || !state.stations.length) return;

  const center = stationMapCenter();
  stationMapInstance = window.L.map(container, {
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: false
  }).setView([center.lat, center.lng], 15);

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(stationMapInstance);

  window.L.control.attribution({ prefix: false }).addTo(stationMapInstance);

  const bounds = [];
  const userLocation = currentLocation();
  const user = window.L.marker([userLocation.lat, userLocation.lng], {
    icon: window.L.divIcon({
      className: 'user-map-pin',
      html: '<span></span><strong>Bạn</strong>',
      iconSize: [46, 32],
      iconAnchor: [23, 16]
    })
  }).addTo(stationMapInstance);
  bounds.push(user.getLatLng());

  state.stations.forEach((station) => {
    const active = station.station_id === state.selectedStationId ? ' active' : '';
    const marker = window.L.marker([Number(station.latitude), Number(station.longitude)], {
      icon: window.L.divIcon({
        className: `real-map-pin${active}`,
        html: `<span></span><strong>${escapeHtml(station.station_name)}</strong>`,
        iconSize: [150, 34],
        iconAnchor: [16, 17]
      })
    }).addTo(stationMapInstance);
    marker.bindPopup(`
      <strong>${escapeHtml(station.station_name)}</strong><br>
      ${escapeHtml(station.address)}<br>
      ${station.available_bikes || 0}/${station.total_bikes || 0} xe rảnh
    `);
    marker.on('click', () => selectStation(station.station_id));
    bounds.push(marker.getLatLng());
  });

  stationMapInstance.fitBounds(bounds, { padding: [34, 34], maxZoom: 16 });
  container.closest('.station-map')?.classList.add('map-ready');
}

function stationMapCenter() {
  const userLocation = currentLocation();
  const points = [...state.stations.map((station) => ({
    lat: Number(station.latitude),
    lng: Number(station.longitude)
  })), { lat: userLocation.lat, lng: userLocation.lng }];
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lng: points.reduce((sum, point) => sum + point.lng, 0) / points.length
  };
}

function disposeStationMap() {
  if (!stationMapInstance) return;
  stationMapInstance.remove();
  stationMapInstance = null;
}

function clearPageMotion() {
  if (!motionContext) return;
  motionContext.revert();
  motionContext = null;
}

function resetScrollOnViewSwitch(isViewSwitch) {
  if (!isViewSwitch) return;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function runPageMotion(view, isViewSwitch) {
  bindMotionInteractions();
  if (!gsap || prefersReducedMotion()) return;

  motionContext = gsap.context(() => {
    if (!isViewSwitch) {
      const updateTargets = view === 'customer'
        ? '.station-card.active, .bike-card, .activity-list li'
        : '.table-wrap tbody tr, .compact-metrics .metric, .admin-form-grid form';
      gsap.fromTo(updateTargets, {
        autoAlpha: 0,
        y: 10,
        scale: 0.99
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.26,
        ease: 'power2.out',
        stagger: { amount: 0.1, from: 'start' }
      });
      return;
    }

    if (view === 'auth') {
      gsap.timeline({ defaults: { duration: 0.56, ease: 'power3.out' } })
        .fromTo('.brand-row, .auth-copy h1, .auth-copy p', {
          autoAlpha: 0,
          y: 20
        }, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.06
        })
        .fromTo('.highlight-chip', {
          autoAlpha: 0,
          y: 12,
          scale: 0.96
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: { amount: 0.18, from: 'start' }
        }, '-=0.26')
        .fromTo('.auth-panel', {
          autoAlpha: 0,
          x: 22,
          scale: 0.985
        }, {
          autoAlpha: 1,
          x: 0,
          scale: 1
        }, 0.08)
        .fromTo('.auth-scene', {
          autoAlpha: 0,
          y: 16,
          scale: 0.98
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1
        }, '-=0.34');
      return;
    }

    gsap.timeline({ defaults: { duration: 0.38, ease: 'power3.out' } })
      .fromTo('.topbar', {
        autoAlpha: 0,
        y: -12
      }, {
        autoAlpha: 1,
        y: 0
      })
      .fromTo('.dashboard-hero', {
        autoAlpha: 0,
        y: 18,
        scale: 0.99
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1
      }, '-=0.2')
      .fromTo('.dashboard-hero .eyebrow, .dashboard-hero h1, .metric, .hero-scene', {
        autoAlpha: 0,
        y: 16
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
        stagger: { amount: 0.16, from: 'start' }
      }, '-=0.2')
      .fromTo('.panel', {
        autoAlpha: 0,
        y: 18,
        scale: 0.99
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.34,
        stagger: { amount: 0.14, from: 'start' }
      }, '-=0.24');
  }, app);
}

function bindMotionInteractions() {
  if (!gsap || prefersReducedMotion()) return;
  document.querySelectorAll('.primary, .secondary, .ghost, .icon-button, .demo-button, .station-card, .bike-card').forEach((element) => {
    element.addEventListener('pointerenter', () => {
      if (element.disabled) return;
      gsap.to(element, {
        y: -2,
        scale: element.classList.contains('bike-card') ? 1.006 : 1.012,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
    element.addEventListener('pointerleave', () => {
      gsap.to(element, {
        y: 0,
        scale: 1,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
    element.addEventListener('pointerdown', () => {
      if (element.disabled) return;
      gsap.to(element, { scale: 0.985, duration: 0.08, overwrite: 'auto' });
    });
    element.addEventListener('pointerup', () => {
      if (element.disabled) return;
      gsap.to(element, { scale: 1.012, duration: 0.14, ease: 'power2.out', overwrite: 'auto' });
    });
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function bikeCard(bike) {
  const disabled = bike.is_available ? '' : 'disabled';
  const status = bike.held_for_pickup ? 'held' : bike.bike_status;
  const typeKey = bikeTypeKey(bike.type_name);
  return `
    <article class="bike-card bike-type-${typeKey} ${bike.is_available ? '' : 'muted'}">
      <div class="bike-visual ${typeKey}" title="${escapeAttr(bike.type_name)}">
        ${bikeTypeSvg(typeKey)}
      </div>
      <h3>${escapeHtml(bike.bike_code)}</h3>
      <p>${escapeHtml(bike.type_name)}</p>
      <span class="status-pill ${bike.is_available ? 'ok' : ''}">${statusLabel(status)}</span>
      <div class="rent-row">
        <select data-duration="${bike.bike_id}" ${disabled}>
          <option value="60">1 giờ - 50k</option>
          <option value="120">2 giờ - 70k</option>
          <option value="180">3 giờ - 100k</option>
        </select>
        <button class="primary small" data-rent="${bike.bike_id}" ${disabled}><img src="/vendor/icons/send.svg" alt="">Thuê</button>
      </div>
    </article>
  `;
}

function bikeTypeKey(typeName) {
  const value = String(typeName || '').toLowerCase();
  if (value.includes('tandem')) return 'tandem';
  if (value.includes('child')) return 'child';
  return 'city';
}

function bikeTypeSvg(typeKey) {
  const tandem = typeKey === 'tandem';
  const child = typeKey === 'child';
  const rearWheel = tandem ? 22 : 24;
  const frontWheel = tandem ? 76 : 72;
  const midSeat = tandem ? '<path class="bike-seat" d="M48 21h13" /><path class="bike-line" d="M54 22v12" />' : '';
  const rearAccessory = child
    ? '<rect class="bike-accent-fill" x="14" y="16" width="15" height="14" rx="3" /><path class="bike-line" d="M21 30v8" />'
    : '';
  const frontAccessory = child
    ? ''
    : '<path class="bike-accent" d="M73 24h11l-2 10H72z" />';

  return `
    <svg viewBox="0 0 96 64" aria-hidden="true" focusable="false">
      <circle class="bike-wheel" cx="${rearWheel}" cy="43" r="13" />
      <circle class="bike-wheel" cx="${frontWheel}" cy="43" r="13" />
      <path class="bike-line" d="M${rearWheel} 43 L39 23 L56 43 L${rearWheel} 43 M56 43 L${frontWheel - 10} 24 L${frontWheel} 43 M39 23 L${frontWheel - 10} 24" />
      <path class="bike-line" d="M39 23h17" />
      <path class="bike-seat" d="M31 19h14" />
      <path class="bike-line" d="M38 21v14" />
      ${midSeat}
      <path class="bike-line" d="M${frontWheel - 10} 24l10-8" />
      <path class="bike-seat" d="M${frontWheel - 3} 16h11" />
      ${rearAccessory}
      ${frontAccessory}
      <circle class="bike-crank" cx="48" cy="43" r="3" />
    </svg>
  `;
}

function customerActivity() {
  const pending = state.history.pendingRequests.map((item) => `
    <li class="activity-item action-item">
      <div><strong>${escapeHtml(item.bike_code)}</strong><span>${escapeHtml(item.pickup_station)} · chờ nhận đến ${formatTime(item.expires_at)}</span></div>
      <button class="ghost small" type="button" data-cancel-request="${item.request_id}"><img src="/vendor/icons/circle-x.svg" alt="">Hủy</button>
    </li>
  `).join('');
  const active = state.history.activeRentals.map((item) => `
    <li><strong>${escapeHtml(item.bike_code)}</strong><span>Đang thuê từ ${formatTime(item.started_at)} · cọc ${money(item.deposit_amount)}</span></li>
  `).join('');
  const completed = state.history.completedRentals.map((item) => `
    <li><strong>${escapeHtml(item.bike_code)}</strong><span>${escapeHtml(item.pickup_station)} → ${escapeHtml(item.return_station || '-')} · ${money(item.total_amount)}</span></li>
  `).join('');
  const archived = state.history.archivedRequests.map((item) => `
    <li class="muted-activity"><strong>${escapeHtml(item.bike_code)}</strong><span>${escapeHtml(item.pickup_station)} · ${requestStatusLabel(item.request_status)}</span></li>
  `).join('');
  const items = `${pending}${active}${completed}${archived}`;
  return items ? `<ul class="activity-list">${items}</ul>` : emptyState('Chưa có lịch sử thuê');
}

function reportView() {
  if (!state.reports) return emptyState('Chưa có dữ liệu báo cáo');
  return `
    <div class="metric-strip compact-metrics">
      ${metric('Lượt thuê', state.reports.totals.rental_count, 'clipboard-list')}
      ${metric('Doanh thu vé', money(state.reports.totals.total_revenue), 'banknote')}
      ${metric('Phụ thu trễ', money(state.reports.totals.late_revenue), 'timer')}
    </div>
    <div class="table-wrap">
      <table class="operations-table report-table">
        <thead><tr><th>Kỳ</th><th>Lượt</th><th>Phí thuê</th><th>Giảm cư dân</th><th>Phụ thu</th><th>Tổng</th></tr></thead>
        <tbody>
          ${state.reports.rows.map((row) => `
            <tr>
              <td>${escapeHtml(row.period_label || '-')}</td>
              <td>${row.rental_count}</td>
              <td>${money(row.base_revenue)}</td>
              <td>${money(row.resident_discounts)}</td>
              <td>${money(row.late_revenue)}</td>
              <td>${money(row.total_revenue)}</td>
            </tr>
          `).join('') || `<tr><td colspan="6">${emptyState('Không có lượt thuê trong kỳ')}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function pendingRequestsTable() {
  if (!state.pendingRequests.length) return emptyState('Không có yêu cầu chờ nhận xe');
  return `
    <div class="table-wrap">
      <table class="operations-table requests-table">
        <thead><tr><th>Mã</th><th>Khách</th><th>Xe / bãi nhận</th><th>Giấy tờ</th><th>Cọc</th><th>Giữ lại</th><th></th></tr></thead>
        <tbody>
          ${state.pendingRequests.map((item) => `
            <tr>
              <td>REQ${item.request_id}</td>
              <td>${escapeHtml(item.full_name)}</td>
              <td><strong>${escapeHtml(item.bike_code)}</strong><span class="cell-subtext">${escapeHtml(item.type_name)} · ${escapeHtml(item.pickup_station)}</span></td>
              <td>
                <div class="stacked-inputs">
                  <select id="doc-type-${item.request_id}" aria-label="Loại giấy tờ REQ${item.request_id}">
                    <option value="CCCD">CCCD</option>
                    <option value="CMND">CMND</option>
                    <option value="Passport">Hộ chiếu</option>
                  </select>
                  <input id="identity-${item.request_id}" value="${escapeAttr(item.identity_number)}" aria-label="Số giấy tờ REQ${item.request_id}">
                </div>
              </td>
              <td><input id="deposit-${item.request_id}" type="number" min="0" step="10000" value="200000" aria-label="Tiền cọc REQ${item.request_id}"></td>
              <td><input id="held-doc-${item.request_id}" value="${escapeAttr(item.identity_number)}" aria-label="Giấy tờ giữ REQ${item.request_id}"></td>
              <td>
                <div class="row-actions">
                  <button class="primary small" data-handover="${item.request_id}"><img src="/vendor/icons/key-round.svg" alt="">Giao</button>
                  <button class="ghost small" data-cancel-request="${item.request_id}"><img src="/vendor/icons/ban.svg" alt="">Hủy</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function activeRentalsTable() {
  if (!state.activeRentals.length) return emptyState('Không có xe đang thuê');
  return `
    <div class="table-wrap">
      <table class="operations-table active-rentals-table">
        <colgroup>
          <col class="col-rental">
          <col class="col-customer">
          <col class="col-bike">
          <col class="col-station">
          <col class="col-return">
          <col class="col-return-time">
          <col class="col-condition">
          <col class="col-note">
          <col class="col-action">
        </colgroup>
        <thead><tr><th>Lượt</th><th>Khách</th><th>Xe</th><th>Bãi nhận</th><th>Bãi trả</th><th>Giờ trả</th><th>Tình trạng</th><th>Ghi chú</th><th></th></tr></thead>
        <tbody>
          ${state.activeRentals.map((item) => `
            <tr>
              <td>RENT${item.rental_id}</td>
              <td>${escapeHtml(item.full_name)}</td>
              <td>${escapeHtml(item.bike_code)}</td>
              <td>${escapeHtml(item.pickup_station)}</td>
              <td>${stationSelect(`return-station-${item.rental_id}`, item.pickup_station_id)}</td>
              <td><input id="returned-at-${item.rental_id}" type="datetime-local" value="${toDatetimeLocal(new Date(Date.now() + 60000))}" aria-label="Giờ trả RENT${item.rental_id}"></td>
              <td>
                <select id="condition-${item.rental_id}">
                  <option value="available">Sẵn sàng</option>
                  <option value="broken">Cần sửa</option>
                </select>
              </td>
              <td><input id="condition-note-${item.rental_id}" value="Nhận xe tại bãi trả" aria-label="Ghi chú tình trạng RENT${item.rental_id}"></td>
              <td><button class="primary small" data-return="${item.rental_id}"><img src="/vendor/icons/receipt-text.svg" alt="">Xuất vé</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function fleetTable() {
  if (!state.fleet.length) return emptyState('Chưa có xe');
  const bikes = filteredFleet();
  if (!bikes.length) return emptyState('Không tìm thấy xe phù hợp');
  const isAdmin = state.user.role === 'admin';
  return `
    <div class="table-wrap">
      <table class="operations-table fleet-table">
        <thead><tr><th>Mã xe</th><th>Loại</th><th>Bãi hiện tại</th><th>Trạng thái</th><th>Lý do</th><th>Giữ chỗ</th><th></th></tr></thead>
        <tbody>
          ${bikes.map((bike) => `
            <tr>
              <td>${isAdmin ? `<input id="bike-code-${bike.bike_id}" value="${escapeAttr(bike.bike_code)}" aria-label="Mã xe ${escapeAttr(bike.bike_code)}">` : escapeHtml(bike.bike_code)}</td>
              <td>${isAdmin ? bikeTypeSelect(`bike-type-${bike.bike_id}`, bike.bike_type_id) : escapeHtml(bike.type_name)}</td>
              <td>${isAdmin ? stationSelect(`bike-station-${bike.bike_id}`, bike.station_id) : escapeHtml(bike.station_name)}</td>
              <td>
                <select id="bike-status-${bike.bike_id}">
                  ${['available', 'rented', 'broken'].map((status) => `<option value="${status}" ${bike.bike_status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}
                </select>
              </td>
              <td><input id="bike-reason-${bike.bike_id}" value="${bike.bike_status === 'broken' ? 'Đánh dấu cần sửa chữa' : 'Kiểm tra vận hành'}" aria-label="Lý do cập nhật ${escapeAttr(bike.bike_code)}"></td>
              <td>${bike.held_for_pickup ? 'Có' : 'Không'}</td>
              <td><button class="secondary small" data-save-bike="${bike.bike_id}"><img src="/vendor/icons/save.svg" alt="">Lưu</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function adminForms() {
  return `
    <section class="panel admin-panel">
      <div class="section-heading"><h2>Dữ liệu vận hành</h2><span>Admin</span></div>
      ${stationManagementTable()}
      <div class="admin-form-grid">
        <form id="station-form" class="form-grid compact">
          <h3>Bãi xe</h3>
          <label>Tên bãi<input name="stationName" required></label>
          <label>Địa chỉ<input name="address" required></label>
          <label>Vĩ độ<input name="latitude" type="number" step="0.000001" value="20.949000" required></label>
          <label>Kinh độ<input name="longitude" type="number" step="0.000001" value="105.934000" required></label>
          <label>Sức chứa<input name="capacity" type="number" min="1" value="20" required></label>
          <label>Trạng thái
            <select name="stationStatus">
              <option value="active">Hoạt động</option>
              <option value="paused">Tạm ngưng</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </label>
          <button class="secondary" type="submit"><img src="/vendor/icons/map-pin-plus.svg" alt="">Thêm bãi</button>
        </form>
        <form id="bike-form" class="form-grid compact">
          <h3>Xe</h3>
          <label>Mã xe<input name="bikeCode" required></label>
          <label>Bãi${stationSelect('new-bike-station')}</label>
          <label>Loại xe
            <select name="bikeTypeId" required>
              ${state.bikeTypes.map((type) => `<option value="${type.bike_type_id}">${escapeHtml(type.type_name)}</option>`).join('')}
            </select>
          </label>
          <label>Trạng thái
            <select name="bikeStatus">
              <option value="available">Sẵn sàng</option>
              <option value="broken">Cần sửa</option>
            </select>
          </label>
          <button class="secondary" type="submit"><img src="/vendor/icons/bike.svg" alt="">Thêm xe</button>
        </form>
      </div>
    </section>
  `;
}

function stationManagementTable() {
  if (!state.stations.length) return '';
  return `
    <div class="table-wrap station-manager">
      <table class="operations-table station-table">
        <thead><tr><th>Tên bãi</th><th>Địa chỉ</th><th>Sức chứa</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
          ${state.stations.map((station) => `
            <tr>
              <td><input id="station-name-${station.station_id}" value="${escapeAttr(station.station_name)}" aria-label="Tên bãi ${escapeAttr(station.station_name)}"></td>
              <td><input id="station-address-${station.station_id}" value="${escapeAttr(station.address)}" aria-label="Địa chỉ ${escapeAttr(station.station_name)}"></td>
              <td><input id="station-capacity-${station.station_id}" type="number" min="1" value="${station.capacity}" aria-label="Sức chứa ${escapeAttr(station.station_name)}"></td>
              <td>${stationStatusSelect(`station-status-${station.station_id}`, station.station_status)}</td>
              <td><button class="secondary small" data-save-station="${station.station_id}"><img src="/vendor/icons/save.svg" alt="">Lưu</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindAuthEvents() {
  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      state.user = (await api('/api/auth/login', { method: 'POST', body })).user;
      resetWorkspaceState();
      await refreshData();
      render();
    }, 'Đã đăng nhập');
  });

  document.querySelector('#register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      state.user = (await api('/api/auth/register', { method: 'POST', body })).user;
      resetWorkspaceState();
      await refreshData();
      render();
    }, 'Đã tạo tài khoản');
  });

  document.querySelectorAll('[data-demo-email]').forEach((button) => {
    button.addEventListener('click', async () => {
      await runAction(async () => {
        state.user = (await api('/api/auth/login', {
          method: 'POST',
          body: { email: button.dataset.demoEmail, password: button.dataset.demoPassword }
        })).user;
        resetWorkspaceState();
        await refreshData();
        render();
      });
    });
  });
}

function bindAppEvents() {
  document.querySelector('#logout').addEventListener('click', async () => {
    await runAction(async () => {
      await api('/api/auth/logout', { method: 'POST' });
      state.user = null;
      resetWorkspaceState();
      render();
    }, 'Đã đăng xuất');
  });
  document.querySelector('#refresh').addEventListener('click', async () => {
    await runAction(async () => {
      await refreshData();
      render();
    }, 'Đã làm mới');
  });

  if (state.user.role === 'customer') {
    bindCustomerEvents();
  } else {
    bindOpsEvents();
  }
}

function resetWorkspaceState() {
  state.selectedTypeId = '';
  state.fleetQuery = '';
  state.reportPeriod = 'day';
  state.reportStationId = '';
  state.reportBikeId = '';
  state.lastTicket = null;
}

function bindCustomerEvents() {
  document.querySelectorAll('[data-station]').forEach((button) => {
    button.addEventListener('click', () => selectStation(Number(button.dataset.station)));
  });
  document.querySelector('#location-preset')?.addEventListener('change', async (event) => {
    state.locationPresetId = event.target.value;
    state.selectedStationId = null;
    await runAction(async () => {
      await refreshData();
      render();
    }, 'Đã cập nhật vị trí tìm kiếm');
  });
  document.querySelector('#station-range')?.addEventListener('change', async (event) => {
    state.stationRangeKm = Number(event.target.value);
    state.selectedStationId = null;
    await runAction(async () => {
      await refreshData();
      render();
    }, 'Đã cập nhật phạm vi tìm bãi');
  });
  document.querySelector('#type-filter').addEventListener('change', async (event) => {
    state.selectedTypeId = event.target.value;
    await runAction(async () => {
      await loadStationBikes();
      render();
    });
  });
  document.querySelector('#resident-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      await api('/api/customer/resident-card', { method: 'POST', body });
      state.user = (await api('/api/session')).user;
      await refreshData();
      render();
    }, 'Đã cập nhật thẻ cư dân');
  });
  document.querySelectorAll('[data-rent]').forEach((button) => {
    button.addEventListener('click', async () => {
      const bikeId = Number(button.dataset.rent);
      const duration = document.querySelector(`[data-duration="${bikeId}"]`).value;
      await runAction(async () => {
        await api('/api/rental-requests', {
          method: 'POST',
          body: {
            bikeId,
            stationId: state.selectedStationId,
            requestedDurationMinutes: Number(duration)
          }
        });
        await refreshData();
        render();
      }, 'Đã gửi yêu cầu thuê xe');
    });
  });
  bindCancelRequestButtons();
}

async function selectStation(stationId) {
  state.selectedStationId = Number(stationId);
  await runAction(async () => {
    await loadStationBikes();
    render();
  });
}

function bindOpsEvents() {
  const reportPeriod = document.querySelector('#report-period');
  if (reportPeriod) {
    reportPeriod.addEventListener('change', async (event) => {
      state.reportPeriod = event.target.value;
      await runAction(async () => {
        await refreshData();
        render();
      });
    });
  }
  const reportStation = document.querySelector('#report-station');
  if (reportStation) {
    reportStation.addEventListener('change', async (event) => {
      state.reportStationId = event.target.value;
      await runAction(async () => {
        await refreshData();
        render();
      });
    });
  }
  const reportBike = document.querySelector('#report-bike');
  if (reportBike) {
    reportBike.addEventListener('change', async (event) => {
      state.reportBikeId = event.target.value;
      await runAction(async () => {
        await refreshData();
        render();
      });
    });
  }
  document.querySelector('#export-report')?.addEventListener('click', () => {
    exportReportCsv();
  });
  document.querySelector('#fleet-search')?.addEventListener('change', (event) => {
    state.fleetQuery = event.target.value;
    render();
  });

  document.querySelectorAll('[data-handover]').forEach((button) => {
    button.addEventListener('click', async () => {
      const requestId = Number(button.dataset.handover);
      await runAction(async () => {
        await api('/api/staff/handover', {
          method: 'POST',
          body: {
            requestId,
            identityDocumentType: document.querySelector(`#doc-type-${requestId}`).value,
            identityDocumentNumber: document.querySelector(`#identity-${requestId}`).value,
            depositAmount: Number(document.querySelector(`#deposit-${requestId}`).value),
            depositDocumentHeld: document.querySelector(`#held-doc-${requestId}`).value
          }
        });
        await refreshData();
        render();
      }, 'Đã giao xe và nhận cọc');
    });
  });

  document.querySelectorAll('[data-return]').forEach((button) => {
    button.addEventListener('click', async () => {
      const rentalId = Number(button.dataset.return);
      await runAction(async () => {
        const ticket = (await api('/api/staff/return', {
          method: 'POST',
          body: {
            rentalId,
            returnStationId: Number(document.querySelector(`#return-station-${rentalId}`).value),
            returnedAt: toIsoFromDatetimeLocal(document.querySelector(`#returned-at-${rentalId}`).value),
            bicycleCondition: document.querySelector(`#condition-${rentalId}`).value,
            conditionNote: document.querySelector(`#condition-note-${rentalId}`).value
          }
        })).ticket;
        state.lastTicket = ticket;
        await refreshData();
        render();
        notify(`Vé TCK${ticket.ticket_id}: ${money(ticket.total_amount)}`);
      });
    });
  });

  document.querySelectorAll('[data-save-bike]').forEach((button) => {
    button.addEventListener('click', async () => {
      const bikeId = Number(button.dataset.saveBike);
      await runAction(async () => {
        if (state.user.role === 'admin') {
          await api(`/api/admin/bikes/${bikeId}`, {
            method: 'PATCH',
            body: {
              bikeCode: document.querySelector(`#bike-code-${bikeId}`).value,
              stationId: Number(document.querySelector(`#bike-station-${bikeId}`).value),
              bikeTypeId: Number(document.querySelector(`#bike-type-${bikeId}`).value)
            }
          });
        }
        await api(`/api/admin/bikes/${bikeId}/status`, {
          method: 'PATCH',
          body: {
            bikeStatus: document.querySelector(`#bike-status-${bikeId}`).value,
            reason: document.querySelector(`#bike-reason-${bikeId}`).value
          }
        });
        await refreshData();
        render();
      }, 'Đã cập nhật xe');
    });
  });

  document.querySelectorAll('[data-save-station]').forEach((button) => {
    button.addEventListener('click', async () => {
      const stationId = Number(button.dataset.saveStation);
      await runAction(async () => {
        await api(`/api/admin/stations/${stationId}`, {
          method: 'PATCH',
          body: {
            stationName: document.querySelector(`#station-name-${stationId}`).value,
            address: document.querySelector(`#station-address-${stationId}`).value,
            capacity: Number(document.querySelector(`#station-capacity-${stationId}`).value),
            stationStatus: document.querySelector(`#station-status-${stationId}`).value
          }
        });
        await refreshData();
        render();
      }, 'Đã cập nhật bãi xe');
    });
  });

  const stationForm = document.querySelector('#station-form');
  if (stationForm) {
    stationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const body = Object.fromEntries(new FormData(event.currentTarget));
      await runAction(async () => {
        await api('/api/admin/stations', { method: 'POST', body });
        event.currentTarget.reset();
        await refreshData();
        render();
      }, 'Đã thêm bãi xe');
    });
  }

  const bikeForm = document.querySelector('#bike-form');
  if (bikeForm) {
    bikeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await runAction(async () => {
        await api('/api/admin/bikes', {
          method: 'POST',
          body: {
            bikeCode: form.get('bikeCode'),
            stationId: Number(document.querySelector('#new-bike-station').value),
            bikeTypeId: Number(form.get('bikeTypeId')),
            bikeStatus: form.get('bikeStatus')
          }
        });
        event.currentTarget.reset();
        await refreshData();
        render();
      }, 'Đã thêm xe');
    });
  }

  bindCancelRequestButtons();
}

function bindCancelRequestButtons() {
  document.querySelectorAll('[data-cancel-request]').forEach((button) => {
    button.addEventListener('click', async () => {
      const requestId = Number(button.dataset.cancelRequest);
      await runAction(async () => {
        await api(`/api/rental-requests/${requestId}/cancel`, { method: 'POST' });
        await refreshData();
        render();
      }, 'Đã hủy yêu cầu thuê');
    });
  });
}

function exportReportCsv() {
  if (!state.reports || !state.reports.rows.length) {
    notify('Không có dữ liệu báo cáo để xuất', true);
    return;
  }
  const rows = [
    ['Ky', 'Luot', 'Phi thue', 'Giam cu dan', 'Phu thu', 'Tong'],
    ...state.reports.rows.map((row) => [
      row.period_label || '-',
      row.rental_count || 0,
      row.base_revenue || 0,
      row.resident_discounts || 0,
      row.late_revenue || 0,
      row.total_revenue || 0
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const suffix = [state.reportPeriod, state.reportStationId || 'all-stations', state.reportBikeId || 'all-bikes'].join('-');
  downloadText(`ecopark-report-${suffix}.csv`, csv, 'text/csv;charset=utf-8');
  notify('Đã xuất báo cáo CSV');
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function filteredFleet() {
  const query = state.fleetQuery.trim().toLowerCase();
  if (!query) return state.fleet;
  return state.fleet.filter((bike) => [
    bike.bike_code,
    bike.type_name,
    bike.station_name,
    statusLabel(bike.bike_status),
    bike.bike_status
  ].some((value) => String(value || '').toLowerCase().includes(query)));
}

async function runAction(action, message) {
  try {
    await action();
    if (message) notify(message);
  } catch (error) {
    notify(error.message, true);
  }
}

async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }
  return payload;
}

function demoButton(email, password, label) {
  return `<button class="demo-button" type="button" data-demo-email="${email}" data-demo-password="${password}">${label}<span>${email}</span></button>`;
}

function metric(label, value, icon) {
  return `
    <div class="metric">
      <img src="/vendor/icons/${icon}.svg" alt="">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function highlight(icon, label) {
  return `
    <span class="highlight-chip">
      <img src="/vendor/icons/${icon}.svg" alt="">
      ${label}
    </span>
  `;
}

function stationSelect(id, selectedId) {
  return `
    <select id="${id}" name="stationId">
      ${state.stations.map((station) => `<option value="${station.station_id}" ${Number(selectedId) === station.station_id ? 'selected' : ''}>${escapeHtml(station.station_name)}</option>`).join('')}
    </select>
  `;
}

function bikeTypeSelect(id, selectedId) {
  return `
    <select id="${id}" name="bikeTypeId">
      ${state.bikeTypes.map((type) => `<option value="${type.bike_type_id}" ${Number(selectedId) === type.bike_type_id ? 'selected' : ''}>${escapeHtml(type.type_name)}</option>`).join('')}
    </select>
  `;
}

function stationStatusSelect(id, selectedStatus) {
  const labels = { active: 'Hoạt động', paused: 'Tạm ngưng', maintenance: 'Bảo trì' };
  return `
    <select id="${id}" name="stationStatus">
      ${Object.entries(labels).map(([value, label]) => `<option value="${value}" ${value === selectedStatus ? 'selected' : ''}>${label}</option>`).join('')}
    </select>
  `;
}

function selectedStationName() {
  return escapeHtml(state.stations.find((station) => station.station_id === state.selectedStationId)?.station_name || '-');
}

function roleLabel(role) {
  if (role === 'admin') return 'Admin / Operator';
  if (role === 'staff') return 'Station Staff / Manager';
  return 'Customer';
}

function statusLabel(status) {
  return ({
    available: 'Sẵn sàng',
    rented: 'Đang thuê',
    broken: 'Cần sửa',
    held: 'Chờ nhận'
  })[status] || status;
}

function requestStatusLabel(status) {
  return ({
    pending_pickup: 'Chờ nhận xe',
    cancelled: 'Đã hủy',
    expired: 'Đã hết hạn',
    converted: 'Đã giao xe'
  })[status] || status;
}

function emptyState(text) {
  return `<p class="empty-state">${text}</p>`;
}

function money(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatTime(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(value));
}

function toDatetimeLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoFromDatetimeLocal(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function notify(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  if (toastTween) toastTween.kill();
  if (gsap && !prefersReducedMotion()) {
    toastTween = gsap.fromTo(toast, {
      autoAlpha: 0,
      y: 16,
      scale: 0.98
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.24,
      ease: 'power2.out',
      overwrite: true
    });
  }
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    if (!gsap || prefersReducedMotion()) {
      toast.classList.remove('show');
      return;
    }
    if (toastTween) toastTween.kill();
    toastTween = gsap.to(toast, {
      autoAlpha: 0,
      y: 14,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => {
        toast.classList.remove('show');
        gsap.set(toast, { clearProps: 'opacity,visibility,transform' });
      }
    });
  }, 3200);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}
