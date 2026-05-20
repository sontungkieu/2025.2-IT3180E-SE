import { mountScene } from '/scene.js';

const state = {
  user: null,
  stations: [],
  bikeTypes: [],
  selectedStationId: null,
  selectedTypeId: '',
  stationBikes: [],
  history: { pendingRequests: [], activeRentals: [], completedRentals: [] },
  pendingRequests: [],
  activeRentals: [],
  fleet: [],
  reports: null,
  reportPeriod: 'day'
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
let stationMapInstance = null;

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
  state.bikeTypes = (await api('/api/bike-types')).bikeTypes;
  state.stations = (await api('/api/stations?lat=20.9491&lng=105.9346')).stations;
  if (!state.selectedStationId && state.stations.length) {
    state.selectedStationId = state.stations[0].station_id;
  }

  if (!state.user) return;

  if (state.user.role === 'customer') {
    state.history = await api('/api/customer/history');
    await loadStationBikes();
  } else {
    state.pendingRequests = (await api('/api/staff/pending-requests')).requests;
    state.activeRentals = (await api('/api/staff/active-rentals')).rentals;
    state.fleet = (await api('/api/admin/bikes')).bikes;
    state.reports = await api(`/api/admin/reports?period=${state.reportPeriod}`);
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
  disposeStationMap();
  if (!state.user) {
    app.innerHTML = authView();
    bindAuthEvents();
    mountScene(document.querySelector('#scene'));
    return;
  }

  app.innerHTML = shellView();
  bindAppEvents();
  mountScene(document.querySelector('#scene'));
  if (state.user.role === 'customer') {
    mountStationMap();
  }
}

function authView() {
  return `
    <main class="auth-layout">
      <section class="auth-copy">
        <div class="brand-row">
          <span class="brand-mark"><img src="/vendor/icons/bike.svg" alt=""></span>
          <div>
            <strong>Ecopark Bicycle Parking</strong>
            <span>Web vận hành thuê - trả xe đạp</span>
          </div>
        </div>
        <h1>Thuê xe, nhận xe và quản lý bãi trong một màn hình sáng rõ.</h1>
        <p>Luồng khách hàng và nhân sự bãi xe được triển khai theo UC001-UC005, dữ liệu lưu cục bộ bằng SQLite.</p>
        <div class="auth-highlights" aria-label="Tóm tắt nghiệp vụ">
          ${highlight('id-card', 'CCCD + cọc 200k')}
          ${highlight('percent', 'Cư dân giảm 40%')}
          ${highlight('bar-chart-3', 'Báo cáo theo kỳ')}
        </div>
        <div id="scene" class="scene auth-scene" aria-hidden="true"></div>
      </section>
      <section class="auth-panel">
        <div class="panel-tabs">
          <button class="segment active" type="button">Đăng nhập</button>
        </div>
        <form id="login-form" class="form-grid">
          <label>Email<input name="email" type="email" value="customer@ecopark.test" required></label>
          <label>Mật khẩu<input name="password" type="password" value="customer123" required></label>
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
          <label>Họ tên<input name="fullName" required></label>
          <label>Email<input name="email" type="email" required></label>
          <label>Số điện thoại<input name="phone" required></label>
          <label>Mật khẩu<input name="password" type="password" minlength="6" required></label>
          <label>CCCD/CMND<input name="identityNumber" required></label>
          <label>Địa chỉ<input name="address" required></label>
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
          <button id="refresh" class="icon-button" type="button" title="Làm mới"><img src="/vendor/icons/refresh-cw.svg" alt=""></button>
          <button id="logout" class="ghost" type="button"><img src="/vendor/icons/log-out.svg" alt="">Đăng xuất</button>
        </div>
      </header>
      <section class="dashboard-hero">
        <div>
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
        ${stationMapView()}
        <div class="station-grid">${state.stations.map(stationCard).join('')}</div>
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
          <select id="report-period" aria-label="Kỳ báo cáo">
            <option value="day" ${state.reportPeriod === 'day' ? 'selected' : ''}>Ngày</option>
            <option value="week" ${state.reportPeriod === 'week' ? 'selected' : ''}>Tuần</option>
            <option value="month" ${state.reportPeriod === 'month' ? 'selected' : ''}>Tháng</option>
          </select>
        </div>
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
      <section class="panel fleet-panel">
        <div class="section-heading">
          <h2>Đội xe</h2>
          <span>${state.fleet.length} xe</span>
        </div>
        ${fleetTable()}
      </section>
      ${state.user.role === 'admin' ? adminForms() : ''}
    </main>
  `;
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
  const lats = state.stations.map((station) => Number(station.latitude));
  const lngs = state.stations.map((station) => Number(station.longitude));
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
    user: project(20.9491, 105.9346),
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
  const user = window.L.marker([20.9491, 105.9346], {
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
  const points = [...state.stations.map((station) => ({
    lat: Number(station.latitude),
    lng: Number(station.longitude)
  })), { lat: 20.9491, lng: 105.9346 }];
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

function bikeCard(bike) {
  const disabled = bike.is_available ? '' : 'disabled';
  const status = bike.held_for_pickup ? 'held' : bike.bike_status;
  return `
    <article class="bike-card ${bike.is_available ? '' : 'muted'}">
      <div class="bike-visual"><img src="/vendor/icons/bike.svg" alt=""></div>
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

function customerActivity() {
  const pending = state.history.pendingRequests.map((item) => `
    <li><strong>${escapeHtml(item.bike_code)}</strong><span>${escapeHtml(item.pickup_station)} · chờ nhận đến ${formatTime(item.expires_at)}</span></li>
  `).join('');
  const active = state.history.activeRentals.map((item) => `
    <li><strong>${escapeHtml(item.bike_code)}</strong><span>Đang thuê từ ${formatTime(item.started_at)} · cọc ${money(item.deposit_amount)}</span></li>
  `).join('');
  const completed = state.history.completedRentals.map((item) => `
    <li><strong>${escapeHtml(item.bike_code)}</strong><span>${escapeHtml(item.pickup_station)} → ${escapeHtml(item.return_station || '-')} · ${money(item.total_amount)}</span></li>
  `).join('');
  const items = `${pending}${active}${completed}`;
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
      <table>
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
      <table>
        <thead><tr><th>Mã</th><th>Khách</th><th>Xe</th><th>Bãi nhận</th><th>CCCD</th><th></th></tr></thead>
        <tbody>
          ${state.pendingRequests.map((item) => `
            <tr>
              <td>REQ${item.request_id}</td>
              <td>${escapeHtml(item.full_name)}</td>
              <td>${escapeHtml(item.bike_code)} · ${escapeHtml(item.type_name)}</td>
              <td>${escapeHtml(item.pickup_station)}</td>
              <td>${escapeHtml(item.identity_number)}</td>
              <td><button class="primary small" data-handover="${item.request_id}" data-identity="${escapeAttr(item.identity_number)}"><img src="/vendor/icons/key-round.svg" alt="">Giao xe</button></td>
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
      <table>
        <thead><tr><th>Lượt</th><th>Khách</th><th>Xe</th><th>Bãi nhận</th><th>Bãi trả</th><th>Tình trạng</th><th></th></tr></thead>
        <tbody>
          ${state.activeRentals.map((item) => `
            <tr>
              <td>RENT${item.rental_id}</td>
              <td>${escapeHtml(item.full_name)}</td>
              <td>${escapeHtml(item.bike_code)}</td>
              <td>${escapeHtml(item.pickup_station)}</td>
              <td>${stationSelect(`return-station-${item.rental_id}`, item.pickup_station_id)}</td>
              <td>
                <select id="condition-${item.rental_id}">
                  <option value="available">Sẵn sàng</option>
                  <option value="broken">Cần sửa</option>
                </select>
              </td>
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
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Mã xe</th><th>Loại</th><th>Bãi</th><th>Trạng thái</th><th>Giữ chỗ</th><th></th></tr></thead>
        <tbody>
          ${state.fleet.map((bike) => `
            <tr>
              <td>${escapeHtml(bike.bike_code)}</td>
              <td>${escapeHtml(bike.type_name)}</td>
              <td>${escapeHtml(bike.station_name)}</td>
              <td>
                <select id="bike-status-${bike.bike_id}">
                  ${['available', 'rented', 'broken'].map((status) => `<option value="${status}" ${bike.bike_status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}
                </select>
              </td>
              <td>${bike.held_for_pickup ? 'Có' : 'Không'}</td>
              <td><button class="secondary small" data-status="${bike.bike_id}"><img src="/vendor/icons/save.svg" alt="">Lưu</button></td>
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
      <div class="section-heading"><h2>Thêm dữ liệu vận hành</h2><span>Admin</span></div>
      <div class="admin-form-grid">
        <form id="station-form" class="form-grid compact">
          <h3>Bãi xe</h3>
          <label>Tên bãi<input name="stationName" required></label>
          <label>Địa chỉ<input name="address" required></label>
          <label>Vĩ độ<input name="latitude" type="number" step="0.000001" value="20.949000" required></label>
          <label>Kinh độ<input name="longitude" type="number" step="0.000001" value="105.934000" required></label>
          <label>Sức chứa<input name="capacity" type="number" min="1" value="20" required></label>
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

function bindAuthEvents() {
  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      state.user = (await api('/api/auth/login', { method: 'POST', body })).user;
      await refreshData();
      render();
    }, 'Đã đăng nhập');
  });

  document.querySelector('#register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      state.user = (await api('/api/auth/register', { method: 'POST', body })).user;
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

function bindCustomerEvents() {
  document.querySelectorAll('[data-station]').forEach((button) => {
    button.addEventListener('click', () => selectStation(Number(button.dataset.station)));
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

  document.querySelectorAll('[data-handover]').forEach((button) => {
    button.addEventListener('click', async () => {
      await runAction(async () => {
        await api('/api/staff/handover', {
          method: 'POST',
          body: {
            requestId: Number(button.dataset.handover),
            identityDocumentType: 'CCCD',
            identityDocumentNumber: button.dataset.identity,
            depositAmount: 200000,
            depositDocumentHeld: button.dataset.identity
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
            bicycleCondition: document.querySelector(`#condition-${rentalId}`).value
          }
        })).ticket;
        await refreshData();
        render();
        notify(`Vé TCK${ticket.ticket_id}: ${money(ticket.total_amount)}`);
      });
    });
  });

  document.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      const bikeId = Number(button.dataset.status);
      await runAction(async () => {
        await api(`/api/admin/bikes/${bikeId}/status`, {
          method: 'PATCH',
          body: {
            bikeStatus: document.querySelector(`#bike-status-${bikeId}`).value,
            reason: 'Cập nhật từ dashboard vận hành'
          }
        });
        await refreshData();
        render();
      }, 'Đã cập nhật trạng thái xe');
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

function notify(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 3200);
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
