import { mountScene } from '/scene.js';

const LOCATION_PRESETS = [
  { id: 'gps-demo', label: 'GPS hiện tại - Ecopark Center', mode: 'gps', lat: 20.9491, lng: 105.9346 },
  { id: 'manual-green-bay', label: 'Nhập tay - Green Bay', mode: 'manual', lat: 20.9536, lng: 105.9329 },
  { id: 'manual-aqua-bay', label: 'Nhập tay - Aqua Bay', mode: 'manual', lat: 20.9468, lng: 105.9327 },
  { id: 'manual-outside', label: 'Nhập tay - ngoài phạm vi', mode: 'manual', lat: 20.9918, lng: 105.8784 }
];

const RENT_DURATION_OPTIONS = [
  { value: '60', label: '1 giờ - 50k', detail: 'Chuyến ngắn quanh Ecopark' },
  { value: '120', label: '2 giờ - 70k', detail: 'Dạo hồ và công viên' },
  { value: '180', label: '3 giờ - 100k', detail: 'Di chuyển nhiều điểm' }
];

const REPORT_PERIOD_OPTIONS = [
  { value: 'day', label: 'Ngày', detail: 'Gom theo từng ngày', icon: 'calendar-days' },
  { value: 'week', label: 'Tuần', detail: 'Tuần trong năm', icon: 'calendar-range' },
  { value: 'month', label: 'Tháng', detail: 'Gom theo từng tháng', icon: 'calendar-check-2' }
];

const GPS_DEMO_ROAD = [
  { lat: 20.953894, lng: 105.933030 },
  { lat: 20.953046, lng: 105.933525 },
  { lat: 20.952550, lng: 105.933737 },
  { lat: 20.951321, lng: 105.934007 },
  { lat: 20.951220, lng: 105.933847 },
  { lat: 20.951048, lng: 105.933788 },
  { lat: 20.950818, lng: 105.933929 },
  { lat: 20.950778, lng: 105.934118 },
  { lat: 20.950879, lng: 105.934310 },
  { lat: 20.950863, lng: 105.934552 },
  { lat: 20.951012, lng: 105.935085 },
  { lat: 20.950929, lng: 105.935365 },
  { lat: 20.950903, lng: 105.935445 },
  { lat: 20.950191, lng: 105.936164 },
  { lat: 20.950002, lng: 105.936478 },
  { lat: 20.949925, lng: 105.936826 },
  { lat: 20.949953, lng: 105.937095 },
  { lat: 20.950493, lng: 105.938015 },
  { lat: 20.950599, lng: 105.938425 },
  { lat: 20.950534, lng: 105.938738 },
  { lat: 20.950098, lng: 105.939718 },
  { lat: 20.950076, lng: 105.941014 },
  { lat: 20.950251, lng: 105.941017 },
  { lat: 20.950721, lng: 105.941166 },
  { lat: 20.949819, lng: 105.941297 },
  { lat: 20.948153, lng: 105.941423 },
  { lat: 20.946923, lng: 105.941694 },
  { lat: 20.946173, lng: 105.941391 },
  { lat: 20.946113, lng: 105.941106 },
  { lat: 20.945716, lng: 105.938157 },
  { lat: 20.945364, lng: 105.934843 },
  { lat: 20.945350, lng: 105.934414 },
  { lat: 20.945495, lng: 105.933731 },
  { lat: 20.946761, lng: 105.933778 },
  { lat: 20.945495, lng: 105.933731 },
  { lat: 20.945350, lng: 105.934414 },
  { lat: 20.945716, lng: 105.938157 },
  { lat: 20.946113, lng: 105.941106 },
  { lat: 20.946173, lng: 105.941391 },
  { lat: 20.946601, lng: 105.941768 },
  { lat: 20.946593, lng: 105.941932 },
  { lat: 20.946662, lng: 105.942032 },
  { lat: 20.946810, lng: 105.942074 },
  { lat: 20.946930, lng: 105.942009 },
  { lat: 20.946986, lng: 105.941877 },
  { lat: 20.948164, lng: 105.941653 },
  { lat: 20.949861, lng: 105.941529 },
  { lat: 20.950512, lng: 105.941440 },
  { lat: 20.951298, lng: 105.941250 },
  { lat: 20.952475, lng: 105.940773 },
  { lat: 20.952964, lng: 105.940479 },
  { lat: 20.953433, lng: 105.940150 },
  { lat: 20.954396, lng: 105.939315 },
  { lat: 20.952272, lng: 105.936688 },
  { lat: 20.951774, lng: 105.935949 },
  { lat: 20.951374, lng: 105.935055 },
  { lat: 20.951196, lng: 105.934340 },
  { lat: 20.951331, lng: 105.934095 },
  { lat: 20.951897, lng: 105.934013 },
  { lat: 20.952591, lng: 105.933812 },
  { lat: 20.953665, lng: 105.933273 },
  { lat: 20.954401, lng: 105.932742 },
  { lat: 20.954933, lng: 105.932272 },
  { lat: 20.954888, lng: 105.932209 }
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
  auditLogs: [],
  demoClock: null,
  reportPeriod: 'day',
  reportStationId: '',
  reportBikeId: '',
  lastTicket: null,
  lastEmailVerificationCode: '',
  lastPasswordResetCode: '',
  lastPasswordResetEmail: '',
  lastKnownLocation: readLastKnownLocation(),
  gpsBikes: [],
  gpsSelectedBikeId: null,
  gpsTargetStationId: null,
  gpsBikePosition: null,
  gpsMode: 'pickup',
  gpsRoutePath: []
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const gsap = window.gsap;
let stationMapInstance = null;
let gpsMapInstance = null;
let gpsBikeMarker = null;
let gpsRouteTween = null;
let motionContext = null;
let currentView = null;
let toastTween = null;
let customSelectEventsBound = false;

init();

async function init() {
  try {
    const session = await api('/api/session');
    state.user = session.user;
    if (isGpsDemoRoute()) {
      await refreshGpsDemoData();
    } else {
      await refreshData();
    }
  } catch (error) {
    notify(error.message, true);
  }
  render();
}

function isGpsDemoRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return pathname === '/gd' || pathname.endsWith('/gd') || pathname === '/gps' || pathname.endsWith('/gps');
}

async function refreshData() {
  const searchLocation = currentLocation();
  rememberSearchLocation(searchLocation);
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
  state.demoClock = await api('/api/demo-clock');

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
    state.auditLogs = (await api('/api/admin/bike-status-logs?limit=12')).logs;
  }
}

async function refreshGpsDemoData() {
  if (state.user) {
    state.demoClock = await api('/api/demo-clock');
  }
  state.bikeTypes = (await api('/api/bike-types')).bikeTypes;
  state.stations = (await api('/api/stations?lat=20.9491&lng=105.9346')).stations;
  const bikesByStation = await Promise.all(state.stations.map(async (station) => {
    const payload = await api(`/api/stations/${station.station_id}/bikes`);
    return payload.bikes.map((bike) => ({
      ...bike,
      station_name: station.station_name,
      station_latitude: station.latitude,
      station_longitude: station.longitude
    }));
  }));
  state.gpsBikes = bikesByStation.flat();
  if (!state.gpsSelectedBikeId && state.gpsBikes.length) {
    state.gpsSelectedBikeId = state.gpsBikes.find((bike) => bike.is_available)?.bike_id || state.gpsBikes[0].bike_id;
  }
  if (!state.gpsTargetStationId && state.stations.length) {
    state.gpsTargetStationId = selectedGpsBike()?.station_id || state.stations[0].station_id;
  }
  if (!state.gpsBikePosition) {
    state.gpsBikePosition = offsetFromStation(selectedGpsTargetStation(), 55);
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
  disposeGpsDemoMap();
  if (isGpsDemoRoute()) {
    const nextView = 'gps-demo';
    const isViewSwitch = currentView !== nextView;
    currentView = nextView;
    app.className = 'app-root view-gps-demo';
    app.innerHTML = gpsDemoView();
    resetScrollOnViewSwitch(isViewSwitch);
    bindGpsDemoEvents();
    mountGpsDemoMap();
    runPageMotion(nextView, isViewSwitch);
    return;
  }
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
            <span>Thuê xe đạp trong Ecopark</span>
          </div>
        </div>
        <h1>Thuê xe đạp Ecopark, nhận xe gần bạn và trả ở bãi thuận tiện.</h1>
        <p>Tìm bãi còn xe, gửi yêu cầu nhận xe, theo dõi lượt thuê và thanh toán vé trả xe trong cùng một ứng dụng.</p>
        <div class="auth-highlights" aria-label="Tóm tắt nghiệp vụ">
          ${highlight('map-pin', 'Tìm bãi gần nhất')}
          ${highlight('bike', 'Chọn xe còn trống')}
          ${highlight('receipt-text', 'Trả xe và nhận vé')}
        </div>
        <div id="scene" class="scene auth-scene" aria-hidden="true"></div>
      </section>
      <section class="auth-panel">
        <div class="auth-panel-header">
          <div>
            <p class="eyebrow">Truy cập hệ thống</p>
            <h2>Đăng nhập</h2>
          </div>
        </div>
        <form id="login-form" class="form-grid">
          <label>Email<input name="email" type="email" value="customer@ecopark.test" autocomplete="username" required></label>
          <label>Mật khẩu<input name="password" type="password" value="customer123" autocomplete="current-password" required></label>
          <button class="primary" type="submit"><img src="/vendor/icons/log-in.svg" alt="">Đăng nhập</button>
        </form>
        <div class="demo-grid">
          ${demoButton('customer@ecopark.test', 'customer123', 'Khách thường', 'Tạo yêu cầu thuê')}
          ${demoButton('resident@ecopark.test', 'resident123', 'Cư dân', 'Áp dụng ưu đãi')}
          ${demoButton('staff@ecopark.test', 'staff123', 'Nhân sự bãi', 'Duyệt nhận/trả xe')}
          ${demoButton('admin@ecopark.test', 'admin123', 'Admin', 'Báo cáo và đội xe')}
          ${demoButton('admin2@ecopark.test', 'admin2123', 'Admin dự phòng', 'Ca vận hành song song')}
        </div>
        <hr>
        <form id="register-form" class="form-grid compact">
          <h2>Tạo tài khoản khách</h2>
          <label>Họ tên<input name="fullName" autocomplete="name" minlength="2" maxlength="80" placeholder="Nguyen Ha Linh" title="Nhập họ tên thật, không dùng số hoặc ký tự đặc biệt" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Số điện thoại<input name="phone" type="tel" inputmode="tel" autocomplete="tel" pattern="0[0-9]{9}|\\+84[0-9]{9}" placeholder="0912345678" title="Nhập số điện thoại Việt Nam 10 chữ số, ví dụ 0912345678" required></label>
          <label>Mật khẩu<input name="password" type="password" minlength="8" pattern="(?=.*[A-Za-z])(?=.*\\d).{8,}" autocomplete="new-password" title="Tối thiểu 8 ký tự, gồm chữ và số" required></label>
          <label>CCCD/CMND<input name="identityNumber" inputmode="numeric" autocomplete="off" pattern="[0-9]{9}|[0-9]{12}" placeholder="001203000111" title="Nhập 9 hoặc 12 chữ số CCCD/CMND" required></label>
          <label>Địa chỉ<input name="address" autocomplete="street-address" minlength="5" placeholder="Park River, Ecopark" required></label>
          ${customerTypeDropdown('visitor')}
          <label>Thẻ cư dân<input name="residentCardNumber" placeholder="Nếu có"></label>
          <button class="secondary" type="submit"><img src="/vendor/icons/user-plus.svg" alt="">Tạo tài khoản</button>
        </form>
        <hr>
        <div class="password-recovery">
          <h2>Khôi phục mật khẩu</h2>
          <form id="reset-request-form" class="form-grid compact">
            <label>Email<input name="email" type="email" value="${escapeAttr(state.lastPasswordResetEmail)}" autocomplete="email" required></label>
            <button class="ghost" type="submit"><img src="/vendor/icons/mail-check.svg" alt="">Gửi mã demo</button>
          </form>
          <form id="reset-confirm-form" class="form-grid compact">
            <label>Email<input name="email" type="email" value="${escapeAttr(state.lastPasswordResetEmail)}" required></label>
            <label>Mã xác nhận<input name="code" inputmode="numeric" value="${escapeAttr(state.lastPasswordResetCode)}" required></label>
            <label>Mật khẩu mới<input name="password" type="password" minlength="8" pattern="(?=.*[A-Za-z])(?=.*\\d).{8,}" title="Tối thiểu 8 ký tự, gồm chữ và số" required></label>
            <button class="secondary" type="submit"><img src="/vendor/icons/key-round.svg" alt="">Đặt lại mật khẩu</button>
          </form>
        </div>
      </section>
    </main>
  `;
}

function shellView() {
  const isCustomer = state.user.role === 'customer';
  return `
    <div class="app-shell command-shell">
      <aside class="command-rail" aria-label="Điều hướng khu vực làm việc">
        <div class="rail-brand">
          <span class="brand-mark rail-mark"><img src="/vendor/icons/bike.svg" alt=""></span>
          <div>
            <strong>EBP</strong>
            <span>${roleLabel(state.user.role)}</span>
          </div>
        </div>
        <nav class="rail-nav">
          ${isCustomer
            ? `${railItem('bike', 'Thuê xe', true, 'workspace-rent')}${railItem('receipt-text', 'Lượt thuê', false, 'workspace-rentals')}${railItem('id-card', 'Tài khoản', false, 'workspace-account')}`
            : `${railItem('layout-dashboard', 'Tổng quan', true, 'workspace-overview')}${railItem('clipboard-check', 'Nhận xe', false, 'workspace-pickup')}${railItem('receipt-text', 'Trả xe', false, 'workspace-return')}${railItem('bar-chart-3', 'Báo cáo', false, 'workspace-reports')}`}
          <button id="mobile-refresh" class="rail-item rail-mobile-action" type="button" title="Làm mới" aria-label="Làm mới dữ liệu"><img src="/vendor/icons/refresh-cw.svg" alt=""><span>Làm mới</span></button>
          <button id="mobile-logout" class="rail-item rail-mobile-action" type="button" title="Đăng xuất" aria-label="Đăng xuất"><img src="/vendor/icons/log-out.svg" alt=""><span>Đăng xuất</span></button>
        </nav>
        <div class="rail-status">
          <span><img src="/vendor/icons/radio-tower.svg" alt="">Đang đồng bộ</span>
          <strong>${isCustomer ? `${state.stations.length} bãi gần bạn` : `${state.pendingRequests.length} yêu cầu chờ`}</strong>
        </div>
      </aside>
      <div class="workspace-main">
        <header class="topbar">
          <div class="brand-row">
            <span class="brand-mark"><img src="/vendor/icons/bike.svg" alt=""></span>
            <div>
              <strong>Ecopark Bicycle Parking</strong>
              <span>${roleLabel(state.user.role)}</span>
            </div>
          </div>
          <div class="user-actions">
            <span class="session-chip"><span class="session-avatar">${userInitials(state.user.full_name)}</span>${escapeHtml(state.user.full_name)}</span>
            <button id="refresh" class="icon-button" type="button" title="Làm mới" aria-label="Làm mới dữ liệu"><img src="/vendor/icons/refresh-cw.svg" alt=""></button>
            <button id="logout" class="ghost" type="button" title="Đăng xuất" aria-label="Đăng xuất"><img src="/vendor/icons/log-out.svg" alt="">Đăng xuất</button>
          </div>
        </header>
        <section id="workspace-overview" class="dashboard-hero">
          <div class="hero-copy">
            <p class="eyebrow">${isCustomer ? 'Khu vực khách hàng' : 'Khu vực vận hành'}</p>
            <h1>${isCustomer ? 'Tìm bãi gần bạn, chọn xe và gửi yêu cầu thuê.' : 'Xử lý nhận xe, trả xe, đội xe và thống kê tập trung.'}</h1>
            <div class="metric-strip">
              ${metric(isCustomer ? 'Bãi gần bạn' : 'Bãi hoạt động', isCustomer ? state.stations.length : state.stations.filter((s) => s.station_status === 'active').length, 'map-pin')}
              ${metric(isCustomer ? 'Xe có thể thuê' : 'Xe sẵn sàng', state.stations.reduce((sum, s) => sum + Number(s.available_bikes || 0), 0), 'bike')}
              ${metric(isCustomer ? 'Lượt đang theo dõi' : 'Yêu cầu chờ', isCustomer ? state.history.pendingRequests.length + state.history.activeRentals.length : state.pendingRequests.length, isCustomer ? 'receipt-text' : 'clipboard-check')}
            </div>
          </div>
          <div id="scene" class="scene hero-scene" aria-hidden="true"></div>
        </section>
        ${isCustomer ? customerView() : operationsView()}
      </div>
    </div>
  `;
}

function railItem(icon, label, active, targetId) {
  const current = active ? ' aria-current="page"' : '';
  return `
    <button class="rail-item ${active ? 'active' : ''}" type="button" data-rail-target="${targetId}" title="${label}" aria-label="${label}"${current}>
      <img src="/vendor/icons/${icon}.svg" alt="">
      <span>${label}</span>
    </button>
  `;
}

function userInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || 'U';
}

function customerView() {
  return `
    <main class="content-grid customer-grid">
      <section class="panel rental-flow-panel" id="workspace-rent">
        <div class="section-heading">
          <h2>Thuê xe</h2>
          <span>${selectedStationName()}</span>
        </div>
        ${stationSearchControls()}
        <div class="rent-workflow">
          <div class="rent-map-column">
            ${stationMapView()}
            <div class="station-grid">${state.stations.map(stationCard).join('') || emptyState('Không có bãi xe trong phạm vi đã chọn')}</div>
          </div>
          <div class="rent-bike-column">
            <div class="inline-panel-heading">
              <h3>Xe rảnh tại bãi đã chọn</h3>
              <span>${state.stationBikes.length} xe</span>
            </div>
            <div class="bike-grid">${state.stationBikes.map(bikeCard).join('') || emptyState('Không có xe phù hợp')}</div>
          </div>
        </div>
      </section>
      <section class="panel history-panel" id="workspace-rentals">
        <div class="section-heading">
          <h2>Lượt thuê của bạn</h2>
          <span>${state.history.pendingRequests.length + state.history.activeRentals.length + state.history.completedRentals.length} lượt</span>
        </div>
        ${customerActivity()}
      </section>
      <section class="panel account-panel" id="workspace-account">
        <div class="section-heading">
          <h2>Tài khoản</h2>
          <span class="status-pill ${state.user.profile.discount_eligible ? 'ok' : ''}">${state.user.profile.customer_type === 'resident' ? 'Cư dân' : 'Khách thường'}</span>
        </div>
        <div class="account-status-grid">
          ${accountStatusCard('mail-check', 'Email', state.user.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh', state.user.email_verified_at ? 'ok' : 'warn')}
          ${accountStatusCard('id-card', 'Định danh', identityStatusLabel(state.user.profile.identity_status), state.user.profile.identity_status === 'verified' ? 'ok' : 'warn')}
          ${accountStatusCard('badge-check', 'Cư dân', residentStatusLabel(state.user.profile.resident_verification_status), state.user.profile.discount_eligible ? 'ok' : '')}
        </div>
        ${state.user.email_verified_at ? '' : `
          <form id="email-verify-form" class="form-grid compact inline-verification-form">
            <h3>Xác minh email demo</h3>
            <label>Mã xác nhận<input name="code" inputmode="numeric" value="${escapeAttr(state.lastEmailVerificationCode)}" required></label>
            <div class="row-actions">
              <button class="ghost" type="button" id="request-email-code"><img src="/vendor/icons/mail-check.svg" alt="">Gửi mã</button>
              <button class="secondary" type="submit"><img src="/vendor/icons/badge-check.svg" alt="">Xác minh</button>
            </div>
          </form>
        `}
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
    </main>
  `;
}

function operationsView() {
  return `
    <main class="content-grid ops-grid">
      <section class="panel report-panel" id="workspace-reports">
        <div class="section-heading">
          <h2>Thống kê</h2>
          <button id="export-report" class="secondary small" type="button"><img src="/vendor/icons/file-down.svg" alt="">Xuất CSV theo bộ lọc</button>
        </div>
        ${reportFilters()}
        ${reportView()}
      </section>
      <section class="panel pending-panel" id="workspace-pickup">
        <div class="section-heading">
          <h2>Yêu cầu nhận xe</h2>
          <span>${state.pendingRequests.length} yêu cầu</span>
        </div>
        ${pendingRequestsTable()}
      </section>
      <section class="panel return-pipeline-panel" id="workspace-return">
        <div class="section-heading">
          <h2>Pipeline trả xe</h2>
          <span>${state.activeRentals.length} lượt đang chạy</span>
        </div>
        ${operationsClockStrip()}
        ${returnPipelineView()}
      </section>
      <section class="panel active-panel">
        <div class="section-heading">
          <h2>Danh sách trả xe</h2>
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
      <section class="panel audit-panel">
        <div class="section-heading">
          <h2>Nhật ký trạng thái xe</h2>
          <span>${state.auditLogs.length} cập nhật gần nhất</span>
        </div>
        ${auditLogView()}
      </section>
      ${state.user.role === 'admin' ? adminForms() : ''}
    </main>
  `;
}

function gpsDemoView() {
  const bike = selectedGpsBike();
  const target = selectedGpsTargetStation();
  const distance = gpsDistanceToTarget();
  const near = distance <= 120;
  return `
    <div class="gps-demo-shell">
      <header class="topbar gps-demo-topbar">
        <div class="brand-row">
          <span class="brand-mark"><img src="/vendor/icons/navigation.svg" alt=""></span>
          <div>
            <strong>Bảng điều khiển demo</strong>
            <span>/gd · GPS xe và đồng hồ hệ thống</span>
          </div>
        </div>
        <div class="user-actions">
          <a class="ghost" href="/"><img src="/vendor/icons/layout-dashboard.svg" alt="">Bảng chính</a>
          <button id="refresh-gps-demo" class="icon-button" type="button" title="Làm mới" aria-label="Làm mới dữ liệu GPS"><img src="/vendor/icons/refresh-cw.svg" alt=""></button>
        </div>
      </header>
      <main class="gps-demo-grid">
        ${demoClockPanel()}
        <section class="panel gps-demo-panel">
          <div class="section-heading">
            <h2>Điều khiển vị trí GPS</h2>
            <span>${state.gpsMode === 'pickup' ? 'UC002 / UC003' : 'UC004'}</span>
          </div>
          <div class="control-group">
            <span class="control-label">Luồng cần diễn</span>
            <div class="segmented-control">
              <button class="segment-option ${state.gpsMode === 'pickup' ? 'active' : ''}" type="button" data-gps-mode="pickup">Mượn / nhận xe</button>
              <button class="segment-option ${state.gpsMode === 'return' ? 'active' : ''}" type="button" data-gps-mode="return">Trả xe</button>
            </div>
          </div>
          <div class="control-group">
            <span class="control-label">Xe cần chỉnh</span>
            <div class="gps-chip-grid gps-bike-grid">
              ${state.gpsBikes.map((item) => gpsBikeChip(item)).join('')}
            </div>
          </div>
          <div class="control-group">
            <span class="control-label">Bãi đích</span>
            <div class="gps-chip-grid gps-station-grid">
              ${state.stations.map((station) => gpsStationChip(station)).join('')}
            </div>
          </div>
          <div class="gps-demo-actions">
            <button class="primary" type="button" data-gps-snap="near"><img src="/vendor/icons/crosshair.svg" alt="">Kéo gần bãi</button>
            <button class="secondary" type="button" data-gps-snap="far"><img src="/vendor/icons/map-pinned.svg" alt="">Đẩy ra xa</button>
          </div>
        </section>
        <section class="panel gps-map-panel">
          <div class="section-heading">
            <h2>Vị trí xe trên bản đồ</h2>
            <span>${bike ? escapeHtml(bike.bike_code) : 'N/A'}</span>
          </div>
          <div id="gps-demo-map" class="gps-demo-map" aria-label="Bản đồ kéo thả GPS xe đạp"></div>
        </section>
        <section class="panel gps-status-panel">
          <div class="section-heading">
            <h2>Điều kiện luồng</h2>
            <span>${target ? escapeHtml(target.station_name) : 'N/A'}</span>
          </div>
          <div class="gps-status-card ${near ? 'ok' : 'warn'}">
            <img src="/vendor/icons/${near ? 'badge-check' : 'badge-alert'}.svg" alt="">
            <div>
              <strong>${near ? 'Đủ gần bãi đích' : 'Chưa đủ gần bãi đích'}</strong>
              <span>${Math.round(distance)} m · ngưỡng 120 m</span>
            </div>
          </div>
          <div class="return-pipeline gps-checklist">
            ${returnStep('map-pin', state.gpsMode === 'pickup' ? 'Chọn bãi nhận' : 'Chọn bãi trả', target ? escapeHtml(target.station_name) : 'Chưa có bãi', Boolean(target))}
            ${returnStep('navigation', 'GPS xe', `${Math.round(distance)} m tới bãi`, near)}
            ${returnStep('bike', state.gpsMode === 'pickup' ? 'Mượn xe' : 'Nhận xe trả', bike ? `${escapeHtml(bike.bike_code)} · ${statusLabel(bike.bike_status)}` : 'Chưa chọn xe', Boolean(bike))}
            ${returnStep('receipt-text', state.gpsMode === 'pickup' ? 'Gửi yêu cầu' : 'Cập nhật vé/trạng thái', near ? 'Có thể diễn flow' : 'Kéo xe gần hơn', near)}
          </div>
          <dl class="detail-list inline-details">
            <div><dt>Lat</dt><dd>${state.gpsBikePosition ? state.gpsBikePosition.lat.toFixed(6) : '-'}</dd></div>
            <div><dt>Lng</dt><dd>${state.gpsBikePosition ? state.gpsBikePosition.lng.toFixed(6) : '-'}</dd></div>
            <div><dt>Loại xe</dt><dd>${bike ? escapeHtml(bike.type_name) : '-'}</dd></div>
          </dl>
        </section>
      </main>
    </div>
  `;
}

function demoClockPanel() {
  const clock = state.demoClock;
  const canControl = ['staff', 'admin'].includes(state.user?.role);
  const currentTime = clock?.currentTime || new Date().toISOString();
  const offset = Number(clock?.offsetMinutes || 0);
  const offsetLabel = offset === 0 ? 'Giờ thật' : `${offset > 0 ? '+' : ''}${offset} phút`;
  return `
    <section class="panel demo-clock-panel">
      <div class="section-heading">
        <h2>Đồng hồ hệ thống</h2>
        <span>${offsetLabel}</span>
      </div>
      <div class="demo-clock-face">
        <img src="/vendor/icons/timer.svg" alt="">
        <div>
          <strong>${formatFullTime(currentTime)}</strong>
          <span>Phí trễ: ${money(clock?.lateFeePer30Minutes || 30000)} / 30 phút</span>
        </div>
      </div>
      ${canControl ? `
        <div class="demo-clock-actions">
          <button class="secondary small" type="button" data-clock-advance="15">+15 phút</button>
          <button class="secondary small" type="button" data-clock-advance="30">+30 phút</button>
          <button class="secondary small" type="button" data-clock-advance="60">+60 phút</button>
          <button class="ghost small" type="button" data-clock-reset>Reset</button>
        </div>
      ` : `
        <p class="clock-note">Đăng nhập staff/admin để tua giờ khi demo phí phạt.</p>
        <div class="demo-clock-actions">
          <button class="secondary small" type="button" data-gd-login="staff@ecopark.test" data-gd-password="staff123">Staff</button>
          <button class="secondary small" type="button" data-gd-login="admin@ecopark.test" data-gd-password="admin123">Admin</button>
        </div>
      `}
    </section>
  `;
}

function gpsBikeChip(bike) {
  const active = Number(state.gpsSelectedBikeId) === bike.bike_id ? 'active' : '';
  const renter = bike.active_rental_customer_name ? ` · ${escapeHtml(bike.active_rental_customer_name)}` : '';
  const heldBy = bike.held_customer_name ? ` · giữ bởi ${escapeHtml(bike.held_customer_name)}` : '';
  return `
    <button class="gps-chip ${active}" type="button" data-gps-bike="${bike.bike_id}">
      <strong>${escapeHtml(bike.bike_code)}</strong>
      <span>${escapeHtml(bikeTypeShortLabel(bike.type_name))} · ${escapeHtml(bike.station_name)}${renter}${heldBy}</span>
    </button>
  `;
}

function gpsStationChip(station) {
  const active = Number(state.gpsTargetStationId) === station.station_id ? 'active' : '';
  return `
    <button class="gps-chip ${active}" type="button" data-gps-station="${station.station_id}">
      <strong>${escapeHtml(station.station_name)}</strong>
      <span>${station.available_bikes || 0}/${station.total_bikes || 0} xe rảnh</span>
    </button>
  `;
}

function selectedGpsBike() {
  return state.gpsBikes.find((bike) => bike.bike_id === Number(state.gpsSelectedBikeId)) || state.gpsBikes[0] || null;
}

function selectedGpsTargetStation() {
  return state.stations.find((station) => station.station_id === Number(state.gpsTargetStationId)) || state.stations[0] || null;
}

function gpsDistanceToTarget() {
  const target = selectedGpsTargetStation();
  const position = state.gpsBikePosition;
  if (!target || !position) return Infinity;
  return distanceMeters(position.lat, position.lng, target.latitude, target.longitude);
}

function setGpsBikeNearTarget(isNear) {
  const target = selectedGpsTargetStation();
  if (!target) return;
  const destination = isNear ? roadPointNearStation(target) : roadPointAwayFromStation(target);
  state.gpsRoutePath = buildRoadRoute(state.gpsBikePosition || destination, destination);
  state.gpsBikePosition = destination;
}

function offsetFromStation(station, meters) {
  if (!station) return { ...GPS_DEMO_ROAD[0] };
  return meters <= 120 ? roadPointNearStation(station) : roadPointAwayFromStation(station);
}

function roadPointNearStation(station) {
  return snapToRoad(Number(station.latitude), Number(station.longitude));
}

function roadPointAwayFromStation(station) {
  const stationLat = Number(station.latitude);
  const stationLng = Number(station.longitude);
  const minimumDemoDistance = 320;
  let fallback = { point: GPS_DEMO_ROAD[0], distance: 0 };
  const candidate = GPS_DEMO_ROAD.find((point) => {
    const distance = distanceMeters(stationLat, stationLng, point.lat, point.lng);
    if (distance > fallback.distance) fallback = { point, distance };
    return distance >= minimumDemoDistance;
  });
  const point = candidate || fallback.point;
  return snapToRoad(point.lat, point.lng);
}

function snapToRoad(lat, lng) {
  let best = { distance: Infinity, point: { ...GPS_DEMO_ROAD[0], roadIndex: 0, roadT: 0 } };
  GPS_DEMO_ROAD.forEach((point, index) => {
    const nextPoint = GPS_DEMO_ROAD[(index + 1) % GPS_DEMO_ROAD.length];
    const candidate = closestPointOnRoadSegment(lat, lng, point, nextPoint);
    const distance = distanceMeters(lat, lng, candidate.lat, candidate.lng);
    if (distance < best.distance) {
      best = {
        distance,
        point: {
          lat: candidate.lat,
          lng: candidate.lng,
          roadIndex: index,
          roadT: candidate.t
        }
      };
    }
  });
  return best.point;
}

function closestPointOnRoadSegment(lat, lng, start, end) {
  const dx = end.lng - start.lng;
  const dy = end.lat - start.lat;
  const lengthSquared = dx * dx + dy * dy;
  const rawT = lengthSquared === 0 ? 0 : ((lng - start.lng) * dx + (lat - start.lat) * dy) / lengthSquared;
  const t = Math.max(0, Math.min(1, rawT));
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t,
    t
  };
}

function nearestRoadIndex(lat, lng) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  GPS_DEMO_ROAD.forEach((point, index) => {
    const distance = distanceMeters(lat, lng, point.lat, point.lng);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function buildRoadRoute(from, to) {
  if (!from || !to) return [];
  const start = roadRef(from);
  const end = roadRef(to);
  const forward = normalizeRoutePath(buildDirectedRoadRoute(start, end, 1));
  const backward = normalizeRoutePath(buildDirectedRoadRoute(start, end, -1));
  return routeLengthMeters(forward) <= routeLengthMeters(backward) ? forward : backward;
}

function roadRef(point) {
  if (Number.isFinite(point?.roadIndex) && Number.isFinite(point?.roadT)) {
    return {
      lat: Number(point.lat),
      lng: Number(point.lng),
      roadIndex: Number(point.roadIndex),
      roadT: Number(point.roadT)
    };
  }
  return snapToRoad(Number(point.lat), Number(point.lng));
}

function buildDirectedRoadRoute(start, end, direction) {
  const route = [{ lat: start.lat, lng: start.lng }];
  const roadCount = GPS_DEMO_ROAD.length;
  if (start.roadIndex === end.roadIndex) {
    const endIsAhead = end.roadT >= start.roadT;
    if ((direction === 1 && endIsAhead) || (direction === -1 && !endIsAhead)) {
      route.push({ lat: end.lat, lng: end.lng });
      return route;
    }
  }

  let vertexIndex = direction === 1 ? (start.roadIndex + 1) % roadCount : start.roadIndex;
  const finalVertexIndex = direction === 1 ? end.roadIndex : (end.roadIndex + 1) % roadCount;
  route.push({ ...GPS_DEMO_ROAD[vertexIndex] });
  while (vertexIndex !== finalVertexIndex) {
    vertexIndex = (vertexIndex + direction + roadCount) % roadCount;
    route.push({ ...GPS_DEMO_ROAD[vertexIndex] });
  }
  route.push({ lat: end.lat, lng: end.lng });
  return route;
}

function normalizeRoutePath(path) {
  return path.reduce((items, point) => {
    const previous = items[items.length - 1];
    if (!previous || distanceMeters(previous.lat, previous.lng, point.lat, point.lng) > 0.2) {
      items.push({ lat: point.lat, lng: point.lng });
    }
    return items;
  }, []);
}

function routeLengthMeters(path) {
  return path.reduce((sum, point, index) => {
    if (index === 0) return sum;
    const previous = path[index - 1];
    return sum + distanceMeters(previous.lat, previous.lng, point.lat, point.lng);
  }, 0);
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const radius = 6371000;
  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLng = toRad(Number(lng2) - Number(lng1));
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(a));
}

function toRad(value) {
  return Number(value) * Math.PI / 180;
}

function stationSearchControls() {
  const typeOptions = [
    { value: '', label: 'Tất cả loại xe', detail: 'Hiển thị toàn bộ xe sẵn sàng', icon: 'filter' },
    ...state.bikeTypes.map((type) => ({
      value: String(type.bike_type_id),
      label: bikeTypeShortLabel(type.type_name),
      detail: type.description || type.type_name,
      icon: 'bike'
    }))
  ];
  const savedLocationOption = state.lastKnownLocation
    ? [{
        value: 'last-known',
        label: 'Vị trí đã lưu',
        detail: state.lastKnownLocation.label || 'Dùng khi GPS/map không phản hồi',
        icon: 'history'
      }]
    : [];
  const locationOptions = [
    ...LOCATION_PRESETS.map((preset) => ({
    value: preset.id,
    label: locationShortLabel(preset),
    detail: preset.mode === 'gps' ? 'Định vị quanh Ecopark Center' : preset.label.replace(/^Nhập tay - /, ''),
    icon: preset.mode === 'gps' ? 'locate-fixed' : 'map-pinned'
    })),
    ...savedLocationOption
  ];
  const rangeOptions = [1, 3, 5, 10].map((range) => ({
    value: String(range),
    label: `${range} km`,
    detail: range <= 3 ? 'Ưu tiên bãi gần nhất' : 'Mở rộng khu vực tìm kiếm',
    icon: 'ruler'
  }));
  return `
    <div class="search-workflow" aria-label="Điều kiện tìm bãi">
      ${filterDropdown('type', 'Loại xe', typeOptions, String(state.selectedTypeId), 'data-type-filter')}
      ${filterDropdown('location', 'Vị trí tìm kiếm', locationOptions, state.locationPresetId, 'data-location-preset')}
      ${filterDropdown('range', 'Phạm vi', rangeOptions, String(state.stationRangeKm), 'data-station-range')}
    </div>
  `;
}

function filterDropdown(name, label, options, selectedValue, dataAttribute) {
  const selected = options.find((option) => String(option.value) === String(selectedValue)) || options[0];
  const menuId = `filter-${name}-menu`;
  return `
    <div class="control-group select-group select-group-${name}">
      <span class="control-label">${escapeHtml(label)}</span>
      <div class="pretty-select" data-select-root>
        <button class="pretty-select-trigger" type="button" data-select-trigger="${escapeAttr(name)}" aria-expanded="false" aria-controls="${menuId}">
          <span class="select-leading"><img src="/vendor/icons/${selected.icon}.svg" alt=""></span>
          <span class="select-value">
            <strong>${escapeHtml(selected.label)}</strong>
            <span>${escapeHtml(selected.detail)}</span>
          </span>
          <img class="select-chevron" src="/vendor/icons/chevron-down.svg" alt="">
        </button>
        <div id="${menuId}" class="pretty-select-menu" role="listbox">
          ${options.map((option) => filterDropdownOption(option, selectedValue, dataAttribute)).join('')}
        </div>
      </div>
    </div>
  `;
}

function filterDropdownOption(option, selectedValue, dataAttribute) {
  const active = String(option.value) === String(selectedValue);
  return `
    <button class="pretty-select-option ${active ? 'active' : ''}" type="button" role="option" aria-selected="${active}" ${dataAttribute}="${escapeAttr(option.value)}">
      <span class="select-leading"><img src="/vendor/icons/${option.icon}.svg" alt=""></span>
      <span class="select-option-copy">
        <strong>${escapeHtml(option.label)}</strong>
        <span>${escapeHtml(option.detail)}</span>
      </span>
      <img class="select-check" src="/vendor/icons/check.svg" alt="">
    </button>
  `;
}

function customerTypeDropdown(selectedValue) {
  const options = [
    { value: 'visitor', label: 'Khách thường', detail: 'Thuê xe theo giá niêm yết', icon: 'id-card' },
    { value: 'resident', label: 'Cư dân Ecopark', detail: 'Áp dụng ưu đãi cư dân khi đủ thông tin', icon: 'badge-check' }
  ];
  const selected = options.find((option) => option.value === selectedValue) || options[0];
  return `
    <div class="control-group select-group register-customer-type" data-register-customer-group>
      <span class="control-label">Loại khách</span>
      <input type="hidden" name="customerType" value="${escapeAttr(selected.value)}">
      <div class="pretty-select" data-select-root>
        <button class="pretty-select-trigger" type="button" data-select-trigger="register-customer-type" aria-expanded="false" aria-controls="register-customer-type-menu">
          <span class="select-leading"><img src="/vendor/icons/${selected.icon}.svg" alt=""></span>
          <span class="select-value">
            <strong>${escapeHtml(selected.label)}</strong>
            <span>${escapeHtml(selected.detail)}</span>
          </span>
          <img class="select-chevron" src="/vendor/icons/chevron-down.svg" alt="">
        </button>
        <div id="register-customer-type-menu" class="pretty-select-menu" role="listbox">
          ${options.map((option) => customerTypeDropdownOption(option, selected.value)).join('')}
        </div>
      </div>
    </div>
  `;
}

function customerTypeDropdownOption(option, selectedValue) {
  const active = option.value === selectedValue;
  return `
    <button class="pretty-select-option ${active ? 'active' : ''}" type="button" role="option" aria-selected="${active}" data-register-customer-type="${escapeAttr(option.value)}">
      <span class="select-leading"><img src="/vendor/icons/${option.icon}.svg" alt=""></span>
      <span class="select-option-copy">
        <strong>${escapeHtml(option.label)}</strong>
        <span>${escapeHtml(option.detail)}</span>
      </span>
      <img class="select-check" src="/vendor/icons/check.svg" alt="">
    </button>
  `;
}

function returnPipelineView() {
  const hasActive = state.activeRentals.length > 0;
  const ticket = state.lastTicket;
  return `
    <div class="return-pipeline">
      ${returnStep('bike', 'Nhận xe', hasActive ? `${state.activeRentals.length} lượt sẵn sàng xử lý` : 'Chưa có lượt đang thuê', hasActive)}
      ${returnStep('map-pin', 'Chọn bãi trả', hasActive ? 'Có thể khác bãi nhận' : 'Chờ rental active', hasActive)}
      ${returnStep('wrench', 'Kiểm tra xe', hasActive ? 'Sẵn sàng hoặc cần sửa' : 'Chờ xe trả', hasActive)}
      ${returnStep('receipt-text', 'Xuất vé', ticket ? `TCK${ticket.ticket_id} · ${money(ticket.total_amount)}` : 'Chưa có vé mới', Boolean(ticket))}
    </div>
  `;
}

function operationsClockStrip() {
  if (!state.demoClock) return '';
  return `
    <div class="ops-clock-strip">
      <span><img src="/vendor/icons/timer.svg" alt="">Giờ hệ thống: <strong>${formatFullTime(state.demoClock.currentTime)}</strong></span>
      <a class="ghost small" href="/gd"><img src="/vendor/icons/sliders-horizontal.svg" alt="">Mở /gd</a>
    </div>
  `;
}

function returnStep(icon, title, value, active) {
  return `
    <div class="return-step ${active ? 'active' : ''}">
      <img src="/vendor/icons/${icon}.svg" alt="">
      <strong>${title}</strong>
      <span>${value}</span>
    </div>
  `;
}

function reportFilters() {
  const stationOptions = [
    { value: '', label: 'Tất cả bãi', detail: `${state.stations.length} bãi hoạt động`, icon: 'map-pin' },
    ...state.stations.map((station) => ({
      value: String(station.station_id),
      label: station.station_name,
      detail: station.address || `${station.available_bikes || 0} xe sẵn sàng`,
      icon: 'map-pinned'
    }))
  ];
  const bikeOptions = [
    { value: '', label: 'Tất cả xe', detail: `${state.fleet.length} xe trong đội`, icon: 'bike' },
    ...state.fleet.map((bike) => ({
      value: String(bike.bike_id),
      label: bike.bike_code,
      detail: `${bikeTypeShortLabel(bike.type_name)} · ${bike.station_name}`,
      icon: 'bike'
    }))
  ];

  return `
    <div class="flow-controls report-controls" aria-label="Bộ lọc báo cáo">
      ${reportFilterDropdown('period', 'Kỳ báo cáo', REPORT_PERIOD_OPTIONS, state.reportPeriod)}
      ${reportFilterDropdown('station', 'Bãi xe', stationOptions, state.reportStationId)}
      ${reportFilterDropdown('bike', 'Xe', bikeOptions, state.reportBikeId)}
    </div>
    <div class="export-state">
      <img src="/vendor/icons/filter.svg" alt="">
      <span>CSV sẽ xuất theo: <strong>${escapeHtml(reportPeriodLabel(state.reportPeriod))}</strong>, <strong>${escapeHtml(selectedStationLabel())}</strong>, <strong>${escapeHtml(selectedBikeLabel())}</strong>.</span>
    </div>
  `;
}

function reportFilterDropdown(name, label, options, selectedValue) {
  const normalizedValue = String(selectedValue ?? '');
  const selected = options.find((option) => String(option.value) === normalizedValue) || options[0];
  const menuId = `report-${name}-menu`;
  return `
    <div class="control-group select-group report-filter report-filter-${name}">
      <span class="control-label">${escapeHtml(label)}</span>
      <div class="pretty-select report-select" data-select-root>
        <button class="pretty-select-trigger report-select-trigger" type="button" data-select-trigger="report-${name}" aria-expanded="false" aria-controls="${menuId}">
          <span class="select-leading"><img src="/vendor/icons/${selected.icon}.svg" alt=""></span>
          <span class="select-value">
            <strong>${escapeHtml(selected.label)}</strong>
            <span>${escapeHtml(selected.detail)}</span>
          </span>
          <img class="select-chevron" src="/vendor/icons/chevron-down.svg" alt="">
        </button>
        <div id="${menuId}" class="pretty-select-menu report-select-menu" role="listbox">
          ${options.map((option) => reportFilterOption(name, option, selected.value)).join('')}
        </div>
      </div>
    </div>
  `;
}

function reportFilterOption(name, option, selectedValue) {
  const active = String(option.value) === String(selectedValue);
  return `
    <button class="pretty-select-option report-select-option ${active ? 'active' : ''}" type="button" role="option" aria-selected="${active}" data-report-filter="${escapeAttr(name)}" data-report-value="${escapeAttr(option.value)}">
      <span class="select-leading"><img src="/vendor/icons/${option.icon}.svg" alt=""></span>
      <span class="select-option-copy">
        <strong>${escapeHtml(option.label)}</strong>
        <span>${escapeHtml(option.detail)}</span>
      </span>
      <img class="select-check" src="/vendor/icons/check.svg" alt="">
    </button>
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
  if (state.locationPresetId === 'last-known' && state.lastKnownLocation) {
    return { ...state.lastKnownLocation, id: 'last-known', mode: 'saved' };
  }
  return LOCATION_PRESETS.find((preset) => preset.id === state.locationPresetId) || LOCATION_PRESETS[0];
}

function locationShortLabel(preset) {
  return ({
    'gps-demo': 'GPS hiện tại',
    'manual-green-bay': 'Green Bay',
    'manual-aqua-bay': 'Aqua Bay',
    'manual-outside': 'Ngoài phạm vi',
    'last-known': 'Vị trí đã lưu'
  })[preset.id] || preset.label;
}

function readLastKnownLocation() {
  try {
    const raw = localStorage.getItem('ecopark-last-search-location');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(Number(parsed.lat)) || !Number.isFinite(Number(parsed.lng))) return null;
    return {
      id: 'last-known',
      label: parsed.label || 'Vị trí đã lưu',
      mode: 'saved',
      lat: Number(parsed.lat),
      lng: Number(parsed.lng)
    };
  } catch {
    return null;
  }
}

function rememberSearchLocation(location) {
  if (!location || location.mode === 'saved') return;
  const stored = {
    label: locationShortLabel(location),
    lat: Number(location.lat),
    lng: Number(location.lng)
  };
  state.lastKnownLocation = { id: 'last-known', mode: 'saved', ...stored };
  try {
    localStorage.setItem('ecopark-last-search-location', JSON.stringify(stored));
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }
}

function bikeTypeShortLabel(typeName) {
  const value = String(typeName || '').toLowerCase();
  if (value.includes('tandem')) return 'Tandem';
  if (value.includes('child')) return 'Child-seat';
  if (value.includes('city')) return 'City';
  return typeName;
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
  const selected = currentLocation();
  const statusCopy = selected.mode === 'gps'
    ? 'Định vị GPS đang bật'
    : selected.mode === 'saved'
      ? 'Đang dùng vị trí đã lưu'
      : 'Vị trí nhập tay';
  return `
    <div class="station-map" aria-label="Bản đồ bãi xe Ecopark">
      <span class="map-status-chip ${selected.mode === 'gps' ? 'ok' : ''}">
        <img src="/vendor/icons/${selected.mode === 'gps' ? 'locate-fixed' : selected.mode === 'saved' ? 'history' : 'map-pinned'}.svg" alt="">
        ${statusCopy}
      </span>
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

function mountGpsDemoMap() {
  const container = document.querySelector('#gps-demo-map');
  if (!container || !window.L || !state.stations.length || !state.gpsBikePosition) return;

  const target = selectedGpsTargetStation();
  const mapCenter = target
    ? { lat: Number(target.latitude), lng: Number(target.longitude) }
    : state.gpsBikePosition;
  gpsMapInstance = window.L.map(container, {
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: false
  }).setView([mapCenter.lat, mapCenter.lng], 15);

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(gpsMapInstance);
  window.L.control.attribution({ prefix: false }).addTo(gpsMapInstance);

  const roadLatLngs = [...GPS_DEMO_ROAD, GPS_DEMO_ROAD[0]].map((point) => [point.lat, point.lng]);
  window.L.polyline(roadLatLngs, {
    color: '#37564d',
    opacity: 0.7,
    weight: 5,
    dashArray: '7 8'
  }).addTo(gpsMapInstance);

  const routePath = state.gpsRoutePath.length > 1 ? state.gpsRoutePath : [state.gpsBikePosition];
  if (routePath.length > 1) {
    window.L.polyline(routePath.map((point) => [point.lat, point.lng]), {
      color: '#fff4cf',
      opacity: 0.96,
      weight: 11
    }).addTo(gpsMapInstance);
    window.L.polyline(routePath.map((point) => [point.lat, point.lng]), {
      color: '#0b7b5c',
      opacity: 0.98,
      weight: 7
    }).addTo(gpsMapInstance);
  }

  state.stations.forEach((station) => {
    const active = station.station_id === Number(state.gpsTargetStationId) ? ' active' : '';
    window.L.marker([Number(station.latitude), Number(station.longitude)], {
      icon: window.L.divIcon({
        className: `real-map-pin${active}`,
        html: `<span></span><strong>${escapeHtml(station.station_name)}</strong>`,
        iconSize: [150, 34],
        iconAnchor: [16, 17]
      })
    }).addTo(gpsMapInstance);
  });

  if (target) {
    window.L.circle([Number(target.latitude), Number(target.longitude)], {
      radius: 120,
      color: '#1596c2',
      fillColor: '#1596c2',
      fillOpacity: 0.08,
      weight: 2
    }).addTo(gpsMapInstance);
  }

  const startPoint = routePath[0] || state.gpsBikePosition;
  gpsBikeMarker = window.L.marker([startPoint.lat, startPoint.lng], {
    draggable: true,
    icon: window.L.divIcon({
      className: 'bike-gps-pin',
      html: '<span><img src="/vendor/icons/bike.svg" alt=""></span><strong>GPS xe</strong>',
      iconSize: [92, 36],
      iconAnchor: [18, 18]
    })
  }).addTo(gpsMapInstance);
  gpsBikeMarker.on('drag', () => {
    const latLng = gpsBikeMarker.getLatLng();
    const snapped = snapToRoad(latLng.lat, latLng.lng);
    gpsBikeMarker.setLatLng([snapped.lat, snapped.lng]);
  });
  gpsBikeMarker.on('dragend', () => {
    const latLng = gpsBikeMarker.getLatLng();
    const snapped = snapToRoad(latLng.lat, latLng.lng);
    state.gpsRoutePath = buildRoadRoute(state.gpsBikePosition, snapped);
    state.gpsBikePosition = snapped;
    notify('Đã đưa GPS xe về tuyến đường hợp lệ');
    render();
  });

  const bounds = window.L.latLngBounds([
    ...roadLatLngs,
    ...state.stations.map((station) => [Number(station.latitude), Number(station.longitude)])
  ]);
  gpsMapInstance.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
  animateGpsMarkerAlongRoute(routePath);
}

function animateGpsMarkerAlongRoute(path) {
  if (!gpsBikeMarker || !path.length) return;
  const route = normalizeRoutePath(path);
  const lastPoint = route[route.length - 1];
  if (route.length < 2 || prefersReducedMotion() || !gsap) {
    gpsBikeMarker.setLatLng([lastPoint.lat, lastPoint.lng]);
    return;
  }

  const totalDistance = routeLengthMeters(route);
  const segmentDistances = route.map((point, index) => {
    if (index === 0) return 0;
    const previous = route[index - 1];
    return distanceMeters(previous.lat, previous.lng, point.lat, point.lng);
  });
  const setMarkerProgress = (progress) => {
    const targetDistance = totalDistance * progress;
    let traveled = 0;
    for (let index = 1; index < route.length; index += 1) {
      const segmentDistance = segmentDistances[index];
      if (traveled + segmentDistance >= targetDistance) {
        const segmentProgress = segmentDistance === 0 ? 1 : (targetDistance - traveled) / segmentDistance;
        const start = route[index - 1];
        const end = route[index];
        gpsBikeMarker.setLatLng([
          start.lat + (end.lat - start.lat) * segmentProgress,
          start.lng + (end.lng - start.lng) * segmentProgress
        ]);
        return;
      }
      traveled += segmentDistance;
    }
    gpsBikeMarker.setLatLng([lastPoint.lat, lastPoint.lng]);
  };

  setMarkerProgress(0);
  const progressTracker = { value: 0 };
  gpsRouteTween = gsap.to(progressTracker, {
    value: 1,
    duration: Math.min(3.2, Math.max(0.9, totalDistance / 180)),
    ease: 'none',
    overwrite: true,
    onUpdate: () => setMarkerProgress(progressTracker.value),
    onComplete: () => setMarkerProgress(1)
  });
}

function disposeGpsDemoMap() {
  if (gpsRouteTween) {
    gpsRouteTween.kill();
    gpsRouteTween = null;
  }
  gpsBikeMarker = null;
  if (!gpsMapInstance) return;
  gpsMapInstance.remove();
  gpsMapInstance = null;
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
  document.querySelectorAll('.primary, .secondary, .ghost, .icon-button, .demo-button, .rail-item, .pretty-select-trigger, .pretty-select-option, .gps-chip, .station-card, .bike-card').forEach((element) => {
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
  const typeKey = bikeTypeKey(bike.type_name);
  const status = bikeAvailabilityLabel(bike);
  return `
    <article class="bike-card bike-type-${typeKey} ${bike.is_available ? '' : 'muted'}">
      <div class="bike-visual ${typeKey}" title="${escapeAttr(bike.type_name)}">
        ${bikeTypeSvg(typeKey)}
      </div>
      <div class="bike-card-copy">
        <h3>${escapeHtml(bike.bike_code)}</h3>
        <div class="bike-card-meta">
          <span>${escapeHtml(bike.type_name)}</span>
        </div>
      </div>
      <span class="status-pill bike-status ${bikeStatusTone(bike)}">${status}</span>
      <div class="rent-row">
        ${rentDurationDropdown(bike)}
        <button class="primary small" data-rent="${bike.bike_id}" ${disabled}><img src="/vendor/icons/send.svg" alt="">Thuê</button>
      </div>
    </article>
  `;
}

function bikeAvailabilityLabel(bike) {
  if (bike.unavailable_reason === 'held_by_you') return 'Chờ bạn nhận';
  if (bike.unavailable_reason === 'held_by_other') return 'Người khác giữ';
  if (bike.unavailable_reason === 'rented_by_you') return 'Bạn đang thuê';
  if (bike.unavailable_reason === 'rented_by_other') return 'Người khác thuê';
  return statusLabel(bike.bike_status);
}

function bikeStatusTone(bike) {
  if (bike.is_available) return 'ok';
  if (bike.unavailable_reason === 'held_by_you' || bike.unavailable_reason === 'rented_by_you') return 'mine';
  if (bike.unavailable_reason === 'held_by_other' || bike.unavailable_reason === 'rented_by_other') return 'busy';
  if (bike.bike_status === 'broken') return 'danger';
  return '';
}

function rentDurationDropdown(bike) {
  const selected = RENT_DURATION_OPTIONS[0];
  const disabled = bike.is_available ? '' : 'disabled';
  const menuId = `duration-${bike.bike_id}-menu`;
  return `
    <div class="duration-select" data-duration-group>
      <input type="hidden" data-duration="${bike.bike_id}" value="${escapeAttr(selected.value)}">
      <div class="pretty-select rent-duration-select ${bike.is_available ? '' : 'disabled'}" data-select-root>
        <button class="pretty-select-trigger duration-select-trigger" type="button" data-select-trigger="duration-${bike.bike_id}" aria-expanded="false" aria-controls="${menuId}" ${disabled}>
          <span class="select-leading"><img src="/vendor/icons/clock-3.svg" alt=""></span>
          <span class="select-value">
            <strong>${escapeHtml(selected.label)}</strong>
          </span>
          <img class="select-chevron" src="/vendor/icons/chevron-down.svg" alt="">
        </button>
        <div id="${menuId}" class="pretty-select-menu duration-select-menu" role="listbox">
          ${RENT_DURATION_OPTIONS.map((option) => rentDurationOption(option, selected.value)).join('')}
        </div>
      </div>
    </div>
  `;
}

function rentDurationOption(option, selectedValue) {
  const active = option.value === selectedValue;
  return `
    <button class="pretty-select-option duration-select-option ${active ? 'active' : ''}" type="button" role="option" aria-selected="${active}" data-duration-option="${escapeAttr(option.value)}">
      <span class="select-leading"><img src="/vendor/icons/clock-3.svg" alt=""></span>
      <span class="select-option-copy">
        <strong>${escapeHtml(option.label)}</strong>
        <span>${escapeHtml(option.detail)}</span>
      </span>
      <img class="select-check" src="/vendor/icons/check.svg" alt="">
    </button>
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
      <div><strong>${escapeHtml(item.bike_code)}</strong><span>${escapeHtml(item.pickup_station)} · ${pickupDeadlineLabel(item)}</span></div>
      <button class="ghost small" type="button" data-cancel-request="${item.request_id}"><img src="/vendor/icons/circle-x.svg" alt="">Hủy</button>
    </li>
  `).join('');
  const active = state.history.activeRentals.map((item) => `
    <li class="activity-item rental-active">
      <strong>${escapeHtml(item.bike_code)}</strong>
      <span>${rentalTimingLabel(item)} · trả dự kiến ${formatTime(item.planned_end_at)} · cọc ${money(item.deposit_amount)}</span>
    </li>
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

function pickupDeadlineLabel(item) {
  const minutes = Number(item.pickup_deadline_minutes || 0);
  if (minutes <= 0) return `đã hết hạn lúc ${formatTime(item.expires_at)}`;
  return `chờ nhận còn ${minutes} phút`;
}

function rentalTimingLabel(item) {
  const late = Number(item.late_minutes || 0);
  if (late > 0) return `Quá hạn ${late} phút · tạm tính phụ thu ${money(item.estimated_late_fee)}`;
  const remaining = Math.max(0, Number(item.remaining_minutes || 0));
  return `Còn ${remaining} phút`;
}

function reportView() {
  if (!state.reports) return emptyState('Chưa có dữ liệu báo cáo');
  return `
    <div class="metric-strip compact-metrics">
      ${metric('Lượt thuê', state.reports.totals.rental_count, 'clipboard-list')}
      ${metric('Doanh thu vé', money(state.reports.totals.total_revenue), 'banknote')}
      ${metric('Phụ thu trễ', money(state.reports.totals.late_revenue), 'timer')}
    </div>
    ${reportCharts()}
    <div class="table-wrap">
      <table class="operations-table report-table">
        <thead><tr><th>Kỳ</th><th>Lượt</th><th>Phí thuê</th><th>Giảm cư dân</th><th>Phụ thu</th><th>Tổng</th></tr></thead>
        <tbody>
          ${state.reports.rows.map((row) => `
            <tr>
              <td data-label="Kỳ">${escapeHtml(row.period_label || '-')}</td>
              <td data-label="Lượt">${row.rental_count}</td>
              <td data-label="Phí thuê">${money(row.base_revenue)}</td>
              <td data-label="Giảm cư dân">${money(row.resident_discounts)}</td>
              <td data-label="Phụ thu">${money(row.late_revenue)}</td>
              <td data-label="Tổng">${money(row.total_revenue)}</td>
            </tr>
          `).join('') || `<tr><td class="empty-table-cell" data-label="" colspan="6">${emptyState('Không có lượt thuê trong kỳ')}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function reportCharts() {
  const rows = [...(state.reports.rows || [])].reverse();
  const maxMoney = Math.max(1, ...rows.flatMap((row) => [Number(row.total_revenue || 0), Number(row.late_revenue || 0)]));
  const fleet = state.reports.fleet || [];
  const fleetTotal = Math.max(1, fleet.reduce((sum, item) => sum + Number(item.count || 0), 0));
  return `
    <div class="report-dashboard" aria-label="Biểu đồ báo cáo vận hành">
      <article class="chart-card revenue-chart">
        <div class="chart-title"><h3>Doanh thu theo kỳ</h3><span>${rows.length} kỳ</span></div>
        <div class="bar-chart">
          ${rows.map((row) => chartBar(row.period_label || '-', Number(row.total_revenue || 0), maxMoney, money(row.total_revenue), 'revenue')).join('') || emptyChart('Chưa có doanh thu')}
        </div>
      </article>
      <article class="chart-card fleet-chart">
        <div class="chart-title"><h3>Trạng thái đội xe</h3><span>${fleetTotal} xe</span></div>
        <div class="fleet-distribution">
          ${fleet.map((item) => fleetStatusBar(item, fleetTotal)).join('') || emptyChart('Chưa có dữ liệu đội xe')}
        </div>
      </article>
      <article class="chart-card total-late-chart">
        <div class="chart-title"><h3>Tổng thu và phụ thu</h3><span>cùng thang tiền</span></div>
        <div class="chart-legend" aria-hidden="true">
          <span><i class="legend-total"></i>Tổng thu</span>
          <span><i class="legend-late"></i>Phụ thu</span>
        </div>
        <div class="dual-bar-chart">
          ${rows.map((row) => `
            <div class="dual-row">
              <span>${escapeHtml(row.period_label || '-')}</span>
              <div class="dual-bars">
                <i class="total" style="--bar:${barPercent(row.total_revenue, maxMoney)}%"></i>
                <i class="late" style="--bar:${barPercent(row.late_revenue, maxMoney)}%"></i>
              </div>
              <strong>${Number(row.rental_count || 0)} lượt · phụ thu ${money(row.late_revenue)}</strong>
            </div>
          `).join('') || emptyChart('Chưa có lượt thuê')}
        </div>
      </article>
    </div>
  `;
}

function chartBar(label, value, maxValue, displayValue, tone) {
  return `
    <div class="chart-row ${tone}">
      <span>${escapeHtml(label)}</span>
      <div class="chart-track"><i style="--bar:${barPercent(value, maxValue)}%"></i></div>
      <strong>${displayValue}</strong>
    </div>
  `;
}

function fleetStatusBar(item, total) {
  const count = Number(item.count || 0);
  const status = item.bike_status || 'unknown';
  return `
    <div class="fleet-status-row ${escapeAttr(status)}">
      <span>${escapeHtml(statusLabel(status))}</span>
      <div class="chart-track"><i style="--bar:${barPercent(count, total)}%"></i></div>
      <strong>${count}</strong>
    </div>
  `;
}

function barPercent(value, maxValue) {
  const number = Number(value || 0);
  if (number <= 0) return 0;
  return Math.max(8, Math.round((number / Math.max(1, Number(maxValue || 1))) * 100));
}

function emptyChart(message) {
  return `<div class="empty-chart">${escapeHtml(message)}</div>`;
}

function auditLogView() {
  if (!state.auditLogs.length) return emptyState('Chưa có nhật ký trạng thái xe');
  return `
    <div class="audit-timeline">
      ${state.auditLogs.map((log) => `
        <article class="audit-item">
          <div class="audit-icon"><img src="/vendor/icons/history.svg" alt=""></div>
          <div>
            <strong>${escapeHtml(log.bike_code)} · ${escapeHtml(statusLabel(log.old_status))} → ${escapeHtml(statusLabel(log.new_status))}</strong>
            <span>${escapeHtml(log.station_name)} · ${escapeHtml(log.changed_by_name)} · ${formatTime(log.changed_at)}</span>
            <p>${escapeHtml(log.reason)}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function pendingRequestsTable() {
  if (!state.pendingRequests.length) return emptyState('Không có yêu cầu chờ nhận xe');
  return `
    <div class="table-wrap">
      <table class="operations-table requests-table">
        <thead><tr><th>Mã</th><th>Khách</th><th>Xe / bãi nhận</th><th>Đổi xe</th><th>Giấy tờ</th><th>Cọc</th><th>Giữ lại</th><th></th></tr></thead>
        <tbody>
          ${state.pendingRequests.map((item) => `
            <tr>
              <td data-label="Mã">REQ${item.request_id}</td>
              <td data-label="Khách">${escapeHtml(item.full_name)}</td>
              <td data-label="Xe / bãi nhận"><strong>${escapeHtml(item.bike_code)}</strong><span class="cell-subtext">${escapeHtml(item.type_name)} · ${escapeHtml(item.pickup_station)}</span></td>
              <td data-label="Đổi xe">
                <div class="stacked-inputs">
                  ${replacementBikeSelect(item)}
                  <button class="ghost small" type="button" data-exchange-request="${item.request_id}"><img src="/vendor/icons/replace.svg" alt="">Đổi</button>
                </div>
              </td>
              <td data-label="Giấy tờ">
                <div class="stacked-inputs">
                  <select id="doc-type-${item.request_id}" aria-label="Loại giấy tờ REQ${item.request_id}">
                    <option value="CCCD">CCCD</option>
                    <option value="CMND">CMND</option>
                    <option value="Passport">Hộ chiếu</option>
                  </select>
                  <input id="identity-${item.request_id}" value="${escapeAttr(item.identity_number)}" aria-label="Số giấy tờ REQ${item.request_id}">
                </div>
              </td>
              <td data-label="Cọc"><input id="deposit-${item.request_id}" type="number" min="0" step="10000" value="200000" aria-label="Tiền cọc REQ${item.request_id}"></td>
              <td data-label="Giữ lại"><input id="held-doc-${item.request_id}" value="${escapeAttr(item.identity_number)}" aria-label="Giấy tờ giữ REQ${item.request_id}"></td>
              <td class="actions-cell" data-label="">
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

function replacementBikeSelect(request) {
  const options = state.fleet.filter((bike) => (
    Number(bike.station_id) === Number(request.pickup_station_id)
    && bike.bike_status === 'available'
    && !bike.held_for_pickup
  ));
  return `
    <select id="exchange-bike-${request.request_id}" aria-label="Xe đổi cho REQ${request.request_id}" ${options.length ? '' : 'disabled'}>
      ${options.map((bike) => `<option value="${bike.bike_id}">${escapeHtml(bike.bike_code)} · ${escapeHtml(bikeTypeShortLabel(bike.type_name))}</option>`).join('') || '<option>Không còn xe rảnh</option>'}
    </select>
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
              <td data-label="Lượt">RENT${item.rental_id}<span class="cell-subtext">${rentalTimingLabel(item)}</span></td>
              <td data-label="Khách">${escapeHtml(item.full_name)}</td>
              <td data-label="Xe"><strong>${escapeHtml(item.bike_code)}</strong><span class="cell-subtext">Dự kiến ${formatTime(item.planned_end_at)}</span></td>
              <td data-label="Bãi nhận">${escapeHtml(item.pickup_station)}</td>
              <td data-label="Bãi trả">${stationSelect(`return-station-${item.rental_id}`, item.pickup_station_id)}</td>
              <td data-label="Giờ trả"><input id="returned-at-${item.rental_id}" type="datetime-local" value="${toDatetimeLocal(defaultReturnTime(item))}" aria-label="Giờ trả RENT${item.rental_id}"></td>
              <td data-label="Tình trạng">
                <select id="condition-${item.rental_id}">
                  <option value="available">Sẵn sàng</option>
                  <option value="broken">Cần sửa</option>
                </select>
              </td>
              <td data-label="Ghi chú"><input id="condition-note-${item.rental_id}" value="Nhận xe tại bãi trả" aria-label="Ghi chú tình trạng RENT${item.rental_id}"></td>
              <td class="actions-cell" data-label=""><button class="primary small" data-return="${item.rental_id}"><img src="/vendor/icons/receipt-text.svg" alt="">Xuất vé</button></td>
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
              <td data-label="Mã xe">${isAdmin ? `<input id="bike-code-${bike.bike_id}" value="${escapeAttr(bike.bike_code)}" aria-label="Mã xe ${escapeAttr(bike.bike_code)}">` : escapeHtml(bike.bike_code)}</td>
              <td data-label="Loại">${isAdmin ? bikeTypeSelect(`bike-type-${bike.bike_id}`, bike.bike_type_id) : escapeHtml(bike.type_name)}</td>
              <td data-label="Bãi hiện tại">${isAdmin ? stationSelect(`bike-station-${bike.bike_id}`, bike.station_id) : escapeHtml(bike.station_name)}</td>
              <td data-label="Trạng thái">
                <select id="bike-status-${bike.bike_id}">
                  ${['available', 'rented', 'broken'].map((status) => `<option value="${status}" ${bike.bike_status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}
                </select>
              </td>
              <td data-label="Lý do"><input id="bike-reason-${bike.bike_id}" value="${bike.bike_status === 'broken' ? 'Đánh dấu cần sửa chữa' : 'Kiểm tra vận hành'}" aria-label="Lý do cập nhật ${escapeAttr(bike.bike_code)}"></td>
              <td data-label="Giữ chỗ">${bike.held_for_pickup ? 'Có' : 'Không'}</td>
              <td class="actions-cell" data-label=""><button class="secondary small" data-save-bike="${bike.bike_id}"><img src="/vendor/icons/save.svg" alt="">Lưu</button></td>
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
      ${policyManagementForms()}
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

function policyManagementForms() {
  return `
    <div class="policy-form-grid">
      <form id="user-status-form" class="form-grid compact">
        <h3>Trạng thái tài khoản</h3>
        <label>User ID<input name="userId" type="number" min="1" placeholder="VD: 4" required></label>
        <label>Trạng thái
          <select name="status">
            <option value="active">Mở khóa</option>
            <option value="blocked">Khóa tài khoản</option>
          </select>
        </label>
        <button class="secondary" type="submit"><img src="/vendor/icons/shield-check.svg" alt="">Cập nhật</button>
      </form>
      <form id="identity-block-form" class="form-grid compact">
        <h3>Khóa CCCD/CMND</h3>
        <label>CCCD/CMND<input name="identityNumber" inputmode="numeric" pattern="[0-9]{9}|[0-9]{12}" required></label>
        <label>Lý do<input name="reason" value="Giấy tờ bị khóa theo chính sách vận hành" required></label>
        <button class="secondary" type="submit"><img src="/vendor/icons/ban.svg" alt="">Khóa giấy tờ</button>
      </form>
      <form id="identity-unblock-form" class="form-grid compact">
        <h3>Mở khóa giấy tờ</h3>
        <label>CCCD/CMND<input name="identityNumber" inputmode="numeric" pattern="[0-9]{9}|[0-9]{12}" required></label>
        <button class="ghost" type="submit"><img src="/vendor/icons/unlock-keyhole.svg" alt="">Mở khóa</button>
      </form>
    </div>
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
              <td data-label="Tên bãi"><input id="station-name-${station.station_id}" value="${escapeAttr(station.station_name)}" aria-label="Tên bãi ${escapeAttr(station.station_name)}"></td>
              <td data-label="Địa chỉ"><input id="station-address-${station.station_id}" value="${escapeAttr(station.address)}" aria-label="Địa chỉ ${escapeAttr(station.station_name)}"></td>
              <td data-label="Sức chứa"><input id="station-capacity-${station.station_id}" type="number" min="1" value="${station.capacity}" aria-label="Sức chứa ${escapeAttr(station.station_name)}"></td>
              <td data-label="Trạng thái">${stationStatusSelect(`station-status-${station.station_id}`, station.station_status)}</td>
              <td class="actions-cell" data-label=""><button class="secondary small" data-save-station="${station.station_id}"><img src="/vendor/icons/save.svg" alt="">Lưu</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindGpsDemoEvents() {
  document.querySelector('#refresh-gps-demo')?.addEventListener('click', async () => {
    await runAction(async () => {
      await refreshGpsDemoData();
      render();
    }, 'Đã làm mới dữ liệu GPS');
  });
  document.querySelectorAll('[data-gd-login]').forEach((button) => {
    button.addEventListener('click', async () => {
      await runAction(async () => {
        state.user = (await api('/api/auth/login', {
          method: 'POST',
          body: { email: button.dataset.gdLogin, password: button.dataset.gdPassword }
        })).user;
        await refreshGpsDemoData();
        render();
      }, 'Đã đăng nhập bảng điều khiển demo');
    });
  });
  document.querySelectorAll('[data-clock-advance]').forEach((button) => {
    button.addEventListener('click', async () => {
      const advanceMinutes = Number(button.dataset.clockAdvance);
      await runAction(async () => {
        state.demoClock = await api('/api/demo-clock', {
          method: 'POST',
          body: { advanceMinutes }
        });
        await refreshGpsDemoData();
        render();
      }, `Đã tua giờ +${advanceMinutes} phút`);
    });
  });
  document.querySelector('[data-clock-reset]')?.addEventListener('click', async () => {
    await runAction(async () => {
      state.demoClock = await api('/api/demo-clock', {
        method: 'POST',
        body: { reset: true }
      });
      await refreshGpsDemoData();
      render();
    }, 'Đã đưa đồng hồ về giờ thật');
  });
  document.querySelectorAll('[data-gps-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.gpsMode = button.dataset.gpsMode;
      state.gpsRoutePath = [];
      render();
    });
  });
  document.querySelectorAll('[data-gps-bike]').forEach((button) => {
    button.addEventListener('click', () => {
      state.gpsSelectedBikeId = Number(button.dataset.gpsBike);
      const bike = selectedGpsBike();
      if (state.gpsMode === 'pickup' && bike) {
        state.gpsTargetStationId = bike.station_id;
      }
      setGpsBikeNearTarget(false);
      render();
    });
  });
  document.querySelectorAll('[data-gps-station]').forEach((button) => {
    button.addEventListener('click', () => {
      state.gpsTargetStationId = Number(button.dataset.gpsStation);
      state.gpsRoutePath = [];
      render();
    });
  });
  document.querySelectorAll('[data-gps-snap]').forEach((button) => {
    button.addEventListener('click', () => {
      setGpsBikeNearTarget(button.dataset.gpsSnap === 'near');
      render();
    });
  });
}

function bindAuthEvents() {
  bindCustomSelectEvents();
  bindRegisterCustomerTypeDropdown();

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
      const payload = await api('/api/auth/register', { method: 'POST', body });
      state.user = payload.user;
      state.lastEmailVerificationCode = payload.demoCode || '';
      resetWorkspaceState();
      await refreshData();
      render();
    }, () => state.lastEmailVerificationCode ? `Đã tạo tài khoản · mã email demo ${state.lastEmailVerificationCode}` : 'Đã tạo tài khoản');
  });

  document.querySelector('#reset-request-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      const payload = await api('/api/auth/request-password-reset', { method: 'POST', body });
      state.lastPasswordResetEmail = body.email;
      state.lastPasswordResetCode = payload.demoCode || '';
      render();
    }, () => state.lastPasswordResetCode ? `Mã đặt lại demo: ${state.lastPasswordResetCode}` : 'Nếu email tồn tại, hệ thống đã tạo mã đặt lại');
  });

  document.querySelector('#reset-confirm-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      await api('/api/auth/reset-password', { method: 'POST', body });
      state.lastPasswordResetCode = '';
      render();
    }, 'Đã đặt lại mật khẩu, có thể đăng nhập lại');
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

function bindRegisterCustomerTypeDropdown() {
  document.querySelectorAll('[data-register-customer-type]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('[data-register-customer-group]');
      const root = button.closest('[data-select-root]');
      const input = group?.querySelector('input[name="customerType"]');
      const trigger = root?.querySelector('[data-select-trigger]');
      const triggerIcon = trigger?.querySelector('.select-leading img');
      const triggerLabel = trigger?.querySelector('.select-value strong');
      const triggerDetail = trigger?.querySelector('.select-value span');
      const optionIcon = button.querySelector('.select-leading img');
      const optionLabel = button.querySelector('.select-option-copy strong');
      const optionDetail = button.querySelector('.select-option-copy span');

      if (input) input.value = button.dataset.registerCustomerType;
      if (triggerIcon && optionIcon) triggerIcon.src = optionIcon.getAttribute('src');
      if (triggerLabel && optionLabel) triggerLabel.textContent = optionLabel.textContent;
      if (triggerDetail && optionDetail) triggerDetail.textContent = optionDetail.textContent;

      root?.querySelectorAll('[data-register-customer-type]').forEach((option) => {
        const active = option === button;
        option.classList.toggle('active', active);
        option.setAttribute('aria-selected', String(active));
      });
      closeCustomSelects();
    });
  });
}

function bindRentDurationDropdowns() {
  document.querySelectorAll('[data-duration-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('[data-duration-group]');
      const root = button.closest('[data-select-root]');
      const input = group?.querySelector('[data-duration]');
      const trigger = root?.querySelector('[data-select-trigger]');
      const triggerLabel = trigger?.querySelector('.select-value strong');
      const triggerDetail = trigger?.querySelector('.select-value span');
      const optionLabel = button.querySelector('.select-option-copy strong');
      const optionDetail = button.querySelector('.select-option-copy span');

      if (input) input.value = button.dataset.durationOption;
      if (triggerLabel && optionLabel) triggerLabel.textContent = optionLabel.textContent;
      if (triggerDetail && optionDetail) triggerDetail.textContent = optionDetail.textContent;

      root?.querySelectorAll('[data-duration-option]').forEach((option) => {
        const active = option === button;
        option.classList.toggle('active', active);
        option.setAttribute('aria-selected', String(active));
      });
      closeCustomSelects();
    });
  });
}

function bindAppEvents() {
  bindRailEvents();
  document.querySelectorAll('#logout, #mobile-logout').forEach((button) => {
    button.addEventListener('click', async () => {
      await runAction(async () => {
        await api('/api/auth/logout', { method: 'POST' });
        state.user = null;
        resetWorkspaceState();
        render();
      }, 'Đã đăng xuất');
    });
  });
  document.querySelectorAll('#refresh, #mobile-refresh').forEach((button) => {
    button.addEventListener('click', async () => {
      await runAction(async () => {
        await refreshData();
        render();
      }, 'Đã làm mới');
    });
  });

  if (state.user.role === 'customer') {
    bindCustomerEvents();
  } else {
    bindOpsEvents();
  }
}

function bindRailEvents() {
  document.querySelectorAll('[data-rail-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.querySelector(`#${button.dataset.railTarget}`);
      if (!target) return;
      target.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  });
}

function resetWorkspaceState() {
  state.selectedTypeId = '';
  state.fleetQuery = '';
  state.reportPeriod = 'day';
  state.reportStationId = '';
  state.reportBikeId = '';
  state.lastTicket = null;
}

function bindCustomSelectEvents() {
  document.querySelectorAll('[data-select-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const root = trigger.closest('[data-select-root]');
      const isOpen = root.classList.contains('open');
      closeCustomSelects(root);
      root.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  if (customSelectEventsBound) return;
  customSelectEventsBound = true;
  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-select-root]')) {
      closeCustomSelects();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCustomSelects();
  });
}

function closeCustomSelects(exceptRoot = null) {
  document.querySelectorAll('[data-select-root].open').forEach((root) => {
    if (exceptRoot && root === exceptRoot) return;
    root.classList.remove('open');
    root.querySelector('[data-select-trigger]')?.setAttribute('aria-expanded', 'false');
  });
}

function bindCustomerEvents() {
  bindCustomSelectEvents();
  bindRentDurationDropdowns();
  document.querySelectorAll('[data-station]').forEach((button) => {
    button.addEventListener('click', () => selectStation(Number(button.dataset.station)));
  });
  document.querySelectorAll('[data-location-preset]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.locationPresetId = button.dataset.locationPreset;
      state.selectedStationId = null;
      await runAction(async () => {
        await refreshData();
        render();
      }, 'Đã cập nhật vị trí tìm kiếm');
    });
  });
  document.querySelectorAll('[data-station-range]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.stationRangeKm = Number(button.dataset.stationRange);
      state.selectedStationId = null;
      await runAction(async () => {
        await refreshData();
        render();
      }, 'Đã cập nhật phạm vi tìm bãi');
    });
  });
  document.querySelectorAll('[data-type-filter]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.selectedTypeId = button.dataset.typeFilter;
      await runAction(async () => {
        await loadStationBikes();
        render();
      });
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
  document.querySelector('#request-email-code')?.addEventListener('click', async () => {
    await runAction(async () => {
      const payload = await api('/api/auth/request-email-verification', { method: 'POST' });
      state.lastEmailVerificationCode = payload.demoCode || '';
      render();
    }, () => state.lastEmailVerificationCode ? `Mã email demo: ${state.lastEmailVerificationCode}` : 'Email đã được xác minh');
  });
  document.querySelector('#email-verify-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      state.user = (await api('/api/auth/verify-email', { method: 'POST', body })).user;
      state.lastEmailVerificationCode = '';
      await refreshData();
      render();
    }, 'Đã xác minh email');
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
  bindCustomSelectEvents();
  bindReportFilterDropdowns();
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

  document.querySelectorAll('[data-exchange-request]').forEach((button) => {
    button.addEventListener('click', async () => {
      const requestId = Number(button.dataset.exchangeRequest);
      const select = document.querySelector(`#exchange-bike-${requestId}`);
      if (!select || !select.value) {
        notify('Không còn xe rảnh để đổi', true);
        return;
      }
      await runAction(async () => {
        await api(`/api/staff/rental-requests/${requestId}/exchange-bike`, {
          method: 'POST',
          body: { bikeId: Number(select.value) }
        });
        await refreshData();
        render();
      }, 'Đã đổi xe cho yêu cầu nhận');
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

  const userStatusForm = document.querySelector('#user-status-form');
  if (userStatusForm) {
    userStatusForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await runAction(async () => {
        await api(`/api/admin/users/${Number(form.get('userId'))}/status`, {
          method: 'POST',
          body: { status: form.get('status') }
        });
        event.currentTarget.reset();
        await refreshData();
        render();
      }, 'Đã cập nhật trạng thái tài khoản');
    });
  }

  const identityBlockForm = document.querySelector('#identity-block-form');
  if (identityBlockForm) {
    identityBlockForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const body = Object.fromEntries(new FormData(event.currentTarget));
      await runAction(async () => {
        await api('/api/admin/blocked-identities', { method: 'POST', body });
        await refreshData();
        render();
      }, 'Đã khóa CCCD/CMND');
    });
  }

  const identityUnblockForm = document.querySelector('#identity-unblock-form');
  if (identityUnblockForm) {
    identityUnblockForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await runAction(async () => {
        await api(`/api/admin/blocked-identities/${encodeURIComponent(form.get('identityNumber'))}`, { method: 'DELETE' });
        await refreshData();
        render();
      }, 'Đã mở khóa CCCD/CMND');
    });
  }

  bindCancelRequestButtons();
}

function bindReportFilterDropdowns() {
  document.querySelectorAll('[data-report-filter]').forEach((button) => {
    button.addEventListener('click', async () => {
      const filter = button.dataset.reportFilter;
      const value = button.dataset.reportValue || '';
      const currentValue = {
        period: state.reportPeriod,
        station: state.reportStationId,
        bike: state.reportBikeId
      }[filter];

      closeCustomSelects();
      if (String(currentValue || '') === String(value)) return;
      if (filter === 'period') state.reportPeriod = value;
      if (filter === 'station') state.reportStationId = value;
      if (filter === 'bike') state.reportBikeId = value;

      await runAction(async () => {
        await refreshData();
        render();
      });
    });
  });
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
    const nextMessage = typeof message === 'function' ? message() : message;
    if (nextMessage) notify(nextMessage);
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

function demoButton(email, password, label, detail) {
  return `<button class="demo-button" type="button" data-demo-email="${email}" data-demo-password="${password}">${label}<span>${detail}</span></button>`;
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

function accountStatusCard(icon, label, value, tone = '') {
  return `
    <div class="account-status-card ${tone}">
      <img src="/vendor/icons/${icon}.svg" alt="">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
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

function reportPeriodLabel(period) {
  return ({ day: 'Theo ngày', week: 'Theo tuần', month: 'Theo tháng' })[period] || 'Theo ngày';
}

function selectedStationLabel() {
  if (!state.reportStationId) return 'Tất cả bãi';
  return state.stations.find((station) => String(station.station_id) === String(state.reportStationId))?.station_name || 'Bãi đã chọn';
}

function selectedBikeLabel() {
  if (!state.reportBikeId) return 'Tất cả xe';
  return state.fleet.find((bike) => String(bike.bike_id) === String(state.reportBikeId))?.bike_code || 'Xe đã chọn';
}

function roleLabel(role) {
  if (role === 'admin') return 'Admin / Điều phối';
  if (role === 'staff') return 'Nhân sự bãi';
  return 'Khách hàng';
}

function statusLabel(status) {
  return ({
    available: 'Sẵn sàng',
    rented: 'Đang thuê',
    broken: 'Cần sửa',
    held: 'Chờ nhận'
  })[status] || status;
}

function identityStatusLabel(status) {
  return ({
    verified: 'Đã xác minh',
    pending: 'Chờ rà soát',
    rejected: 'Từ chối',
    blocked: 'Bị khóa'
  })[status] || 'Chưa rõ';
}

function residentStatusLabel(status) {
  return ({
    verified: 'Đã xác minh',
    pending: 'Chờ rà soát',
    rejected: 'Từ chối'
  })[status] || 'Chưa nộp';
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

function formatFullTime(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
}

function defaultReturnTime(item) {
  const current = new Date(state.demoClock?.currentTime || item.current_time || Date.now());
  const minimum = new Date(new Date(item.started_at).getTime() + 60000);
  return new Date(Math.max(current.getTime(), minimum.getTime()));
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
