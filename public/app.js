import { mountScene } from '/scene.js?v=20260710-mobility-garden';

const DEFAULT_GPS_DEMO_LOCATION = Object.freeze({
  id: 'gps-demo',
  label: 'GPS hiện tại - Spring Park Gate',
  mode: 'gps',
  lat: 20.950889,
  lng: 105.936712
});

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

const THEME_STORAGE_KEY = 'ecopark-theme';
const THEME_OPTIONS = ['light', 'dark', 'system'];
const DEMO_ACCOUNTS = Object.freeze([
  { email: 'customer@ecopark.test', password: 'customer123', label: 'Khách thường' },
  { email: 'resident@ecopark.test', password: 'resident123', label: 'Cư dân Ecopark' },
  { email: 'staff@ecopark.test', password: 'staff123', label: 'Nhân sự · Spring Park Gate' },
  { email: 'staff.greenbay@ecopark.test', password: 'greenbay123', label: 'Nhân sự · Green Bay Marina' },
  { email: 'staff.swanlake@ecopark.test', password: 'swanlake123', label: 'Nhân sự · Swan Lake Plaza' },
  { email: 'admin@ecopark.test', password: 'admin123', label: 'Admin / Operator' },
  { email: 'admin2@ecopark.test', password: 'admin2123', label: 'Admin dự phòng' }
]);
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const CUSTOMER_GPS_SYNC_INTERVAL_MS = 700;
const CUSTOMER_GPS_DATA_REFRESH_INTERVAL_MS = 1800;
const GPS_DEMO_STREAM_INTERVAL_MS = 420;
const RENTAL_COUNTDOWN_INTERVAL_MS = 1000;
const LATE_FEE_BLOCK_SECONDS = 30 * 60;

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
  themePreference: readThemePreference(),
  stations: [],
  bikeTypes: [],
  selectedStationId: null,
  selectedTypeId: '',
  locationPresetId: 'gps-demo',
  stationRangeKm: 1,
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
  opsActionError: null,
  lastEmailVerificationCode: '',
  lastPasswordResetCode: '',
  lastPasswordResetEmail: '',
  recentDemoAccounts: [],
  lastKnownLocation: readLastKnownLocation(),
  gpsDemoPosition: null,
  gpsUsers: [],
  gpsUserQuery: '',
  gpsSelectedCustomerId: null,
  gpsSessions: [],
  gpsSelectedSessionKey: null,
  gpsTargetStationId: null,
  gpsBikePosition: null,
  gpsMode: 'pickup',
  gpsRoutePath: [],
  gpsMapView: null,
  gpsDemoLoading: false
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const gsap = window.gsap;
let stationMapInstance = null;
let stationUserMarker = null;
let stationUserTween = null;
let gpsMapInstance = null;
let gpsBikeMarker = null;
let gpsRouteTween = null;
let motionContext = null;
let currentView = null;
let toastTween = null;
let customSelectEventsBound = false;
let railScrollHandler = null;
let railPreferredTargetId = null;
let railIntentEventsBound = false;
let customerGpsSyncTimer = null;
let customerGpsSyncBusy = false;
let customerGpsLastDataRefreshAt = 0;
let customerGpsDataRefreshTimer = null;
let rentalCountdownTimer = null;
let demoClockClientSyncedAtMs = Date.now();
let gpsDemoPersistQueue = Promise.resolve();

applyThemePreference();
bindSystemThemePreference();
init();

async function init() {
  try {
    const session = await api('/api/session');
    state.user = session.user;
    if (isGpsDemoRoute()) {
      await refreshGpsDemoDataWithLoading({ renderInitial: true });
    } else {
      await refreshData();
    }
  } catch (error) {
    state.gpsDemoLoading = false;
    notify(error.message, true);
  }
  render();
}

function readThemePreference() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_OPTIONS.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

function bindSystemThemePreference() {
  systemThemeQuery.addEventListener('change', () => {
    if (state.themePreference === 'system') applyThemePreference();
  });
}

function setDemoClock(clock) {
  state.demoClock = clock;
  demoClockClientSyncedAtMs = Date.now();
  return clock;
}

function resolvedTheme() {
  if (state.themePreference === 'system') {
    return systemThemeQuery.matches ? 'dark' : 'light';
  }
  return state.themePreference;
}

function applyThemePreference() {
  const theme = resolvedTheme();
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = state.themePreference;
  document.documentElement.style.colorScheme = theme;
}

function nextThemePreference() {
  const currentIndex = THEME_OPTIONS.indexOf(state.themePreference);
  return THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
}

function themeOptionMeta(preference = state.themePreference) {
  return {
    light: { label: 'Sáng', icon: 'sun' },
    dark: { label: 'Tối', icon: 'moon' },
    system: { label: 'Hệ thống', icon: 'monitor' }
  }[preference] || { label: 'Hệ thống', icon: 'monitor' };
}

function themeToggleButton() {
  const current = themeOptionMeta();
  const next = themeOptionMeta(nextThemePreference());
  return `
    <button class="icon-button theme-toggle" type="button" data-theme-toggle title="Chế độ màu: ${current.label}. Bấm để chuyển ${next.label}" aria-label="Chế độ màu: ${current.label}">
      <img src="/vendor/icons/${current.icon}.svg" alt="">
      <span>${current.label}</span>
    </button>
  `;
}

function passwordField({ label = 'Mật khẩu', name = 'password', value = '', autocomplete = 'new-password', attributes = '' } = {}) {
  const valueAttr = value ? ` value="${escapeAttr(value)}"` : '';
  const extraAttrs = attributes ? ` ${attributes}` : '';
  return `
    <label class="password-label">
      <span>${escapeHtml(label)}</span>
      <span class="password-field">
        <input name="${escapeAttr(name)}" type="password"${valueAttr} autocomplete="${escapeAttr(autocomplete)}"${extraAttrs}>
        <button class="password-toggle" type="button" data-password-toggle title="Hiện mật khẩu" aria-label="Hiện mật khẩu">
          <img src="/vendor/icons/eye.svg" alt="">
        </button>
      </span>
    </label>
  `;
}

function bindThemeEvents() {
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      state.themePreference = nextThemePreference();
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, state.themePreference);
      } catch {
        // localStorage can be unavailable in hardened browsers; keep the in-memory preference.
      }
      applyThemePreference();
      render();
    });
  });
}

function isGpsDemoRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return pathname === '/gd' || pathname.endsWith('/gd') || pathname === '/gps' || pathname.endsWith('/gps');
}

async function refreshData() {
  if (state.locationPresetId === 'gps-demo') {
    await refreshGpsDemoPosition({ silent: true });
  }
  const searchLocation = currentLocation();
  rememberSearchLocation(searchLocation);
  state.bikeTypes = (await api('/api/bike-types')).bikeTypes;
  const stationParams = new URLSearchParams({
    lat: String(searchLocation.lat),
    lng: String(searchLocation.lng)
  });
  if (state.selectedTypeId) stationParams.set('typeId', state.selectedTypeId);
  const stationResults = (await api(`/api/stations?${stationParams}`)).stations;
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
  setDemoClock(await api('/api/demo-clock'));

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
    setDemoClock(await api('/api/demo-clock'));
  }
  await refreshGpsDemoPosition({ silent: true });
  state.bikeTypes = (await api('/api/bike-types')).bikeTypes;
  state.stations = (await api('/api/stations?lat=20.9491&lng=105.9346')).stations;
  state.gpsUsers = (await api('/api/gps-demo/users')).users;
  state.gpsSessions = (await api('/api/gps-demo/sessions')).sessions;
  if (state.gpsSelectedCustomerId && !state.gpsUsers.some((user) => Number(user.user_id) === Number(state.gpsSelectedCustomerId))) {
    state.gpsSelectedCustomerId = null;
  }
  if (!selectedGpsSession() && gpsSessionsForMode().length) {
    state.gpsSelectedSessionKey = gpsSessionsForMode()[0].session_key;
  }
  if (!state.gpsSelectedCustomerId) {
    state.gpsSelectedCustomerId = selectedGpsSession()?.customer_id || state.gpsUsers[0]?.user_id || null;
  }
  if (!state.gpsTargetStationId && state.stations.length) {
    state.gpsTargetStationId = selectedGpsSession()?.target_station_id || state.stations[0].station_id;
  }
  if (!state.gpsBikePosition) {
    const userPosition = selectedGpsUserPosition();
    state.gpsBikePosition = userPosition
      ? { lat: userPosition.lat, lng: userPosition.lng }
      : state.gpsDemoPosition
      ? { lat: state.gpsDemoPosition.lat, lng: state.gpsDemoPosition.lng }
      : offsetFromStation(selectedGpsTargetStation(), 55);
  }
}

async function refreshGpsDemoDataWithLoading({ renderInitial = false } = {}) {
  const shouldShowLoading = renderInitial || !state.stations.length;
  state.gpsDemoLoading = true;
  if (shouldShowLoading) render();
  try {
    await refreshGpsDemoData();
  } finally {
    state.gpsDemoLoading = false;
    if (shouldShowLoading) render();
  }
}

async function refreshGpsDemoPosition({ customerId = null, silent = false } = {}) {
  try {
    const effectiveCustomerId = Number(customerId || (state.user?.role === 'customer' ? state.user.user_id : 0) || 0);
    const suffix = effectiveCustomerId ? `?customerId=${encodeURIComponent(effectiveCustomerId)}` : '';
    const payload = await api(`/api/gps-demo/position${suffix}`);
    state.gpsDemoPosition = normalizeClientGpsPosition(payload.position);
    return state.gpsDemoPosition;
  } catch (error) {
    if (!silent) throw error;
    return state.gpsDemoPosition;
  }
}

async function persistGpsDemoPosition(position, customerId = selectedGpsCustomerId()) {
  if (!position) return;
  try {
    const payload = await api('/api/gps-demo/position', {
      method: 'POST',
      body: {
        ...(customerId ? { customerId } : {}),
        latitude: position.lat,
        longitude: position.lng,
        label: 'GPS hiện tại'
      }
    });
    state.gpsDemoPosition = normalizeClientGpsPosition(payload.position);
    if (customerId && state.gpsDemoPosition) {
      state.gpsUsers = state.gpsUsers.map((user) => Number(user.user_id) === Number(customerId)
        ? { ...user, position: state.gpsDemoPosition }
        : user);
    }
  } catch (error) {
    notify(error.message, true);
  }
}

function queuePersistGpsDemoPosition(position, customerId = selectedGpsCustomerId()) {
  const queuedPosition = position ? { lat: position.lat, lng: position.lng } : null;
  gpsDemoPersistQueue = gpsDemoPersistQueue
    .catch(() => null)
    .then(() => persistGpsDemoPosition(queuedPosition, customerId));
  return gpsDemoPersistQueue;
}

function normalizeClientGpsPosition(position) {
  const lat = Number(position?.lat ?? position?.latitude);
  const lng = Number(position?.lng ?? position?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: 'gps-demo',
    customerId: Number(position.customerId || position.customer_id || 0) || null,
    label: position.label || 'GPS hiện tại',
    mode: 'gps',
    lat,
    lng,
    updatedAt: typeof position.updatedAt === 'string' ? position.updatedAt : null
  };
}

function gpsPositionChanged(previous, next) {
  if (!previous || !next) return Boolean(previous || next);
  return distanceMeters(previous.lat, previous.lng, next.lat, next.lng) > 2;
}

function moveStationUserMarker(position) {
  if (!stationMapInstance || !stationUserMarker || !position || !window.L) return;
  const target = { lat: Number(position.lat), lng: Number(position.lng) };
  if (!Number.isFinite(target.lat) || !Number.isFinite(target.lng)) return;
  const current = stationUserMarker.getLatLng();
  const setLatLng = (lat, lng) => stationUserMarker?.setLatLng([lat, lng]);
  if (stationUserTween) {
    stationUserTween.kill();
    stationUserTween = null;
  }
  if (!gsap || prefersReducedMotion()) {
    setLatLng(target.lat, target.lng);
  } else {
    const tracker = { lat: current.lat, lng: current.lng };
    stationUserTween = gsap.to(tracker, {
      lat: target.lat,
      lng: target.lng,
      duration: 0.55,
      ease: 'none',
      overwrite: true,
      onUpdate: () => setLatLng(tracker.lat, tracker.lng),
      onComplete: () => {
        setLatLng(target.lat, target.lng);
        stationUserTween = null;
      }
    });
  }
  const latLng = window.L.latLng(target.lat, target.lng);
  if (!stationMapInstance.getBounds().contains(latLng)) {
    stationMapInstance.panTo(latLng, { animate: !prefersReducedMotion() });
  }
}

function syncCustomerGpsPolling(view) {
  stopCustomerGpsSync();
  if (view !== 'customer' || state.locationPresetId !== 'gps-demo') return;
  customerGpsSyncTimer = window.setInterval(async () => {
    if (customerGpsSyncBusy) return;
    customerGpsSyncBusy = true;
    const previous = state.gpsDemoPosition;
    try {
      const next = await refreshGpsDemoPosition({ silent: true });
      if (gpsPositionChanged(previous, next)) {
        moveStationUserMarker(next);
        scheduleCustomerGpsDataRefresh();
      }
    } finally {
      customerGpsSyncBusy = false;
    }
  }, CUSTOMER_GPS_SYNC_INTERVAL_MS);
}

function syncRentalCountdown(view) {
  stopRentalCountdown();
  if (view !== 'customer' || !state.user || state.user.role !== 'customer') return;
  updateRentalCountdownNodes();
  if (!document.querySelector('[data-rental-countdown]')) return;
  rentalCountdownTimer = window.setInterval(updateRentalCountdownNodes, RENTAL_COUNTDOWN_INTERVAL_MS);
}

function stopRentalCountdown() {
  if (rentalCountdownTimer) {
    window.clearInterval(rentalCountdownTimer);
    rentalCountdownTimer = null;
  }
}

function scheduleCustomerGpsDataRefresh() {
  const elapsedMs = Date.now() - customerGpsLastDataRefreshAt;
  const delayMs = Math.max(0, CUSTOMER_GPS_DATA_REFRESH_INTERVAL_MS - elapsedMs);
  if (customerGpsDataRefreshTimer) {
    window.clearTimeout(customerGpsDataRefreshTimer);
    customerGpsDataRefreshTimer = null;
  }
  customerGpsDataRefreshTimer = window.setTimeout(async () => {
    customerGpsDataRefreshTimer = null;
    if (currentView !== 'customer' || state.locationPresetId !== 'gps-demo') return;
    customerGpsLastDataRefreshAt = Date.now();
    state.selectedStationId = null;
    await refreshData();
    render();
  }, delayMs);
}

function stopCustomerGpsSync() {
  if (customerGpsSyncTimer) {
    window.clearInterval(customerGpsSyncTimer);
    customerGpsSyncTimer = null;
  }
  if (customerGpsDataRefreshTimer) {
    window.clearTimeout(customerGpsDataRefreshTimer);
    customerGpsDataRefreshTimer = null;
  }
  customerGpsSyncBusy = false;
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
    stopCustomerGpsSync();
    stopRentalCountdown();
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
  const reusableScene = isViewSwitch ? null : document.querySelector('#scene');
  currentView = nextView;
  app.className = `app-root view-${nextView}`;

  if (!state.user) {
    stopCustomerGpsSync();
    stopRentalCountdown();
    app.innerHTML = authView();
    resetScrollOnViewSwitch(isViewSwitch);
    bindAuthEvents();
    restoreOrMountScene(reusableScene);
    runPageMotion(nextView, isViewSwitch);
    return;
  }

  app.innerHTML = shellView();
  resetScrollOnViewSwitch(isViewSwitch);
  bindAppEvents();
  restoreOrMountScene(reusableScene);
  if (state.user.role === 'customer') {
    mountStationMap();
    syncCustomerGpsPolling(nextView);
    syncRentalCountdown(nextView);
  } else {
    stopCustomerGpsSync();
    stopRentalCountdown();
  }
  runPageMotion(nextView, isViewSwitch);
}

function restoreOrMountScene(reusableScene) {
  const placeholder = document.querySelector('#scene');
  if (!placeholder) return;
  if (reusableScene?.querySelector('.park-scene-canvas')) {
    placeholder.replaceWith(reusableScene);
    return;
  }
  mountScene(placeholder);
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
        <p>Tìm bãi còn xe, gửi yêu cầu nhận xe, xem lượt thuê và thanh toán vé trả xe trong cùng một ứng dụng.</p>
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
          ${themeToggleButton()}
        </div>
        <form id="login-form" class="form-grid">
          <label>Email<input name="email" type="email" value="customer@ecopark.test" autocomplete="username" required></label>
          ${passwordField({ value: 'customer123', autocomplete: 'current-password', attributes: 'required' })}
          <button class="primary" type="submit"><img src="/vendor/icons/log-in.svg" alt="">Đăng nhập</button>
        </form>
        <p class="demo-quick-label">Điền nhanh tài khoản demo</p>
        <div class="demo-grid" aria-label="Danh sách tài khoản điền nhanh">
          ${availableDemoAccounts().map((account) => demoButton(account)).join('')}
        </div>
        <hr>
        <form id="register-form" class="form-grid compact">
          <h2>Tạo tài khoản khách</h2>
          <label>Họ tên<input name="fullName" autocomplete="name" minlength="2" maxlength="80" placeholder="Nguyen Ha Linh" title="Nhập họ tên thật, không dùng số hoặc ký tự đặc biệt" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Số điện thoại<input name="phone" type="tel" inputmode="tel" autocomplete="tel" pattern="0[0-9]{9}|\\+84[0-9]{9}" placeholder="0912345678" title="Nhập số điện thoại Việt Nam 10 chữ số, ví dụ 0912345678" required></label>
          ${passwordField({ attributes: 'minlength="8" pattern="(?=.*[A-Za-z])(?=.*\\d).{8,}" title="Tối thiểu 8 ký tự, gồm chữ và số" required' })}
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
            ${passwordField({ label: 'Mật khẩu mới', attributes: 'minlength="8" pattern="(?=.*[A-Za-z])(?=.*\\d).{8,}" title="Tối thiểu 8 ký tự, gồm chữ và số" required' })}
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
            : `${railItem('clipboard-check', 'Nhận xe', true, 'workspace-pickup')}${railItem('route', 'Pipeline trả', false, 'workspace-return-pipeline')}${railItem('receipt-text', 'Danh sách trả', false, 'workspace-return-list')}${railItem('bike', 'Đội xe', false, 'workspace-fleet')}${railItem('bar-chart-3', 'Báo cáo', false, 'workspace-reports')}${railItem('history', 'Nhật ký', false, 'workspace-audit')}`}
          <button id="mobile-refresh" class="rail-item rail-mobile-action" type="button" title="Làm mới" aria-label="Làm mới dữ liệu"><img src="/vendor/icons/refresh-cw.svg" alt=""><span>Làm mới</span></button>
          <button class="rail-item rail-mobile-action" type="button" data-theme-toggle title="Chế độ màu" aria-label="Chế độ màu"><img src="/vendor/icons/${themeOptionMeta().icon}.svg" alt=""><span>Giao diện</span></button>
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
            ${themeToggleButton()}
            <button id="refresh" class="icon-button" type="button" title="Làm mới" aria-label="Làm mới dữ liệu"><img src="/vendor/icons/refresh-cw.svg" alt=""></button>
            <button id="logout" class="ghost" type="button" title="Đăng xuất" aria-label="Đăng xuất"><img src="/vendor/icons/log-out.svg" alt="">Đăng xuất</button>
          </div>
        </header>
        <section id="workspace-overview" class="dashboard-hero">
          <div class="hero-copy">
            <p class="eyebrow">${isCustomer ? 'Khu vực khách hàng' : 'Khu vực vận hành'}</p>
            <h1>${isCustomer ? 'Tìm bãi gần bạn, chọn xe và gửi yêu cầu thuê.' : 'Theo dõi ca vận hành, nhận trả xe và tình trạng đội xe.'}</h1>
            <div class="metric-strip">
              ${metric(isCustomer ? 'Bãi gần bạn' : 'Bãi hoạt động', isCustomer ? state.stations.length : state.stations.filter((s) => s.station_status === 'active').length, 'map-pin')}
              ${metric(isCustomer ? 'Xe có thể thuê' : 'Xe sẵn sàng', state.stations.reduce((sum, s) => sum + Number(s.available_bikes || 0), 0), 'bike')}
              ${metric(isCustomer ? 'Đang xử lý' : 'Yêu cầu chờ', isCustomer ? state.history.pendingRequests.length + state.history.activeRentals.length : state.pendingRequests.length, isCustomer ? 'receipt-text' : 'clipboard-check')}
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
        ${rentalLateFeeNote()}
      </section>
      <section class="panel account-panel" id="workspace-account">
        <div class="section-heading">
          <h2>Tài khoản</h2>
          <span class="status-pill ${state.user.profile.discount_eligible ? 'ok' : ''}">${state.user.profile.customer_type === 'resident' ? 'Cư dân' : 'Khách thường'}</span>
        </div>
        <div class="account-status-grid">
          ${accountStatusCard('mail-check', 'Email', state.user.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh', state.user.email_verified_at ? 'ok' : 'warn')}
          ${accountStatusCard('id-card', 'CCCD/CMND', identityStatusLabel(state.user.profile.identity_status), state.user.profile.identity_status === 'verified' ? 'ok' : 'warn')}
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
      <section class="panel pending-panel" id="workspace-pickup">
        <div class="section-heading">
          <h2>Yêu cầu nhận xe</h2>
          <span>${state.pendingRequests.length} yêu cầu</span>
        </div>
        ${opsActionErrorView('pickup')}
        ${pendingRequestsTable()}
      </section>
      <section class="panel return-pipeline-panel" id="workspace-return-pipeline">
        <div class="section-heading">
          <h2>Pipeline trả xe</h2>
          <span>${state.activeRentals.length} lượt đang chạy</span>
        </div>
        ${operationsClockStrip()}
        ${returnPipelineView()}
      </section>
      <section class="panel active-panel" id="workspace-return-list">
        <div class="section-heading">
          <h2>Danh sách trả xe</h2>
          <span>${state.activeRentals.length} lượt</span>
        </div>
        ${opsActionErrorView('return')}
        ${activeRentalsTable()}
      </section>
      ${state.lastTicket ? ticketPanel() : ''}
      <section class="panel fleet-panel" id="workspace-fleet">
        <div class="section-heading">
          <h2>Đội xe</h2>
          <span>${state.fleet.length} xe</span>
        </div>
        ${fleetControls()}
        ${fleetTable()}
      </section>
      <section class="panel report-panel" id="workspace-reports">
        <div class="section-heading">
          <h2>Báo cáo & CSV</h2>
          <button id="export-report" class="secondary small" type="button"><img src="/vendor/icons/file-down.svg" alt="">Xuất CSV theo bộ lọc</button>
        </div>
        ${reportFilters()}
        ${reportView()}
      </section>
      <section class="panel audit-panel" id="workspace-audit">
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
  if (state.gpsDemoLoading && !state.stations.length) {
    return gpsDemoLoadingView();
  }
  const session = selectedGpsSession();
  const selectedUser = selectedGpsUser();
  const target = selectedGpsTargetStation();
  const distance = gpsDistanceToTarget();
  const radius = gpsTargetRadiusMeters();
  const markerReady = Boolean(selectedGpsCustomerId());
  const near = markerReady && distance <= radius;
  const sessions = gpsSessionsForMode();
  const sessionDisabled = markerReady ? '' : ' disabled aria-disabled="true"';
  return `
    <div class="gps-demo-shell">
      <header class="topbar gps-demo-topbar">
        <div class="brand-row">
          <span class="brand-mark"><img src="/vendor/icons/navigation.svg" alt=""></span>
          <div>
            <strong>Bảng điều khiển demo</strong>
            <span>/gd · GPS người dùng và đồng hồ hệ thống</span>
          </div>
        </div>
        <div class="user-actions">
          <a class="ghost" href="/"><img src="/vendor/icons/layout-dashboard.svg" alt="">Bảng chính</a>
          ${themeToggleButton()}
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
            <span class="control-label">Tìm tài khoản</span>
            <label class="gps-user-search">
              <img src="/vendor/icons/search.svg" alt="">
              <input id="gps-user-query" value="${escapeAttr(state.gpsUserQuery)}" placeholder="Tên, email hoặc loại khách">
            </label>
            <div class="gps-chip-grid gps-user-grid">
              ${filteredGpsUsers().map((item) => gpsUserChip(item)).join('') || emptyState('Không tìm thấy tài khoản')}
            </div>
          </div>
          <div class="control-group">
            <span class="control-label">${state.gpsMode === 'pickup' ? 'Phiên chờ nhận xe' : 'Phiên đang thuê'}</span>
            <div class="gps-chip-grid gps-bike-grid">
              ${sessions.map((item) => gpsSessionChip(item)).join('') || emptyState(state.gpsMode === 'pickup' ? 'Chưa có yêu cầu nhận xe' : 'Chưa có lượt đang thuê')}
            </div>
          </div>
          <div class="control-group">
            <span class="control-label">Bãi đích</span>
            <div class="gps-chip-grid gps-station-grid">
              ${state.stations.map((station) => gpsStationChip(station)).join('')}
            </div>
          </div>
          <div class="gps-demo-actions">
            <button class="primary" type="button" data-gps-snap="near"${sessionDisabled}><img src="/vendor/icons/crosshair.svg" alt="">Kéo gần bãi</button>
            <button class="secondary" type="button" data-gps-snap="far"${sessionDisabled}><img src="/vendor/icons/map-pinned.svg" alt="">Đẩy ra xa</button>
          </div>
        </section>
        <section class="panel gps-map-panel">
          <div class="section-heading">
            <h2>Vị trí người dùng trên bản đồ</h2>
            <span>${selectedUser ? escapeHtml(selectedUser.full_name) : session ? escapeHtml(session.customer_name) : 'N/A'}</span>
          </div>
          <div id="gps-demo-map" class="gps-demo-map" aria-label="Bản đồ kéo thả GPS người dùng"></div>
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
              <span>${Number.isFinite(distance) ? Math.round(distance) : '-'} m · bán kính ${radius} m</span>
            </div>
          </div>
          <div class="return-pipeline gps-checklist">
            ${returnStep('map-pin', state.gpsMode === 'pickup' ? 'Chọn bãi nhận' : 'Chọn bãi trả', target ? escapeHtml(target.station_name) : 'Chưa có bãi', Boolean(target))}
            ${returnStep('navigation', 'GPS người dùng', `${Number.isFinite(distance) ? Math.round(distance) : '-'} m tới bãi`, near)}
            ${returnStep('bike', state.gpsMode === 'pickup' ? 'Mượn xe' : 'Nhận xe trả', session ? `${escapeHtml(session.bike_code)} · ${escapeHtml(session.customer_name)}` : selectedUser ? escapeHtml(selectedUser.full_name) : 'Chưa chọn user', markerReady)}
            ${returnStep('receipt-text', state.gpsMode === 'pickup' ? 'Giao xe' : 'Cập nhật vé/trạng thái', near ? 'Có thể diễn flow' : 'Kéo user gần hơn', near)}
          </div>
          <dl class="detail-list inline-details">
            <div><dt>Lat</dt><dd>${state.gpsBikePosition ? state.gpsBikePosition.lat.toFixed(6) : '-'}</dd></div>
            <div><dt>Lng</dt><dd>${state.gpsBikePosition ? state.gpsBikePosition.lng.toFixed(6) : '-'}</dd></div>
            <div><dt>User</dt><dd>${selectedUser ? escapeHtml(selectedUser.email) : '-'}</dd></div>
            <div><dt>Loại xe</dt><dd>${session ? escapeHtml(session.type_name) : '-'}</dd></div>
            <div><dt>Xác nhận trả</dt><dd>${session?.return_confirmed_at ? formatTime(session.return_confirmed_at) : '-'}</dd></div>
          </dl>
        </section>
      </main>
    </div>
  `;
}

function gpsDemoLoadingView() {
  return `
    <div class="gps-demo-shell">
      <header class="topbar gps-demo-topbar">
        <div class="brand-row">
          <span class="brand-mark"><img src="/vendor/icons/navigation.svg" alt=""></span>
          <div>
            <strong>Bảng điều khiển demo</strong>
            <span>/gd · GPS người dùng và đồng hồ hệ thống</span>
          </div>
        </div>
        <div class="user-actions">
          <a class="ghost" href="/"><img src="/vendor/icons/layout-dashboard.svg" alt="">Bảng chính</a>
          ${themeToggleButton()}
          <button id="refresh-gps-demo" class="icon-button" type="button" title="Làm mới" aria-label="Làm mới dữ liệu GPS"><img src="/vendor/icons/refresh-cw.svg" alt=""></button>
        </div>
      </header>
      <main class="gps-demo-grid gps-loading-grid" aria-busy="true">
        <section class="panel gps-loading-state">
          <div>
            <h2>Đang tải dữ liệu demo</h2>
            <p>Chuẩn bị danh sách bãi, xe và tuyến đường GPS.</p>
          </div>
          <div class="skeleton-block wide"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-block short"></div>
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

function gpsSessionChip(session) {
  const active = state.gpsSelectedSessionKey === session.session_key
    || (!state.gpsSelectedSessionKey && Number(state.gpsSelectedCustomerId) === Number(session.customer_id))
    ? 'active'
    : '';
  const station = session.flow === 'pickup' ? session.pickup_station : (session.return_station || session.target_station);
  const status = session.flow === 'pickup'
    ? 'Chờ nhận xe'
    : session.return_confirmed_at ? 'Đã xác nhận trả' : 'Đang thuê';
  return `
    <button class="gps-chip ${active}" type="button" data-gps-session="${escapeAttr(session.session_key)}">
      <strong>${escapeHtml(session.customer_name)}</strong>
      <span>${escapeHtml(session.bike_code)} · ${escapeHtml(bikeTypeShortLabel(session.type_name))} · ${escapeHtml(station)} · ${status}</span>
    </button>
  `;
}

function filteredGpsUsers() {
  const query = state.gpsUserQuery.trim().toLowerCase();
  const users = state.gpsUsers || [];
  if (!query) return users;
  return users.filter((user) => [
    user.full_name,
    user.email,
    user.customer_type,
    user.identity_status
  ].some((value) => String(value || '').toLowerCase().includes(query)));
}

function gpsUserChip(user) {
  const active = Number(state.gpsSelectedCustomerId) === Number(user.user_id) ? 'active' : '';
  const workflow = Number(user.active_count || 0) > 0
    ? `${user.active_count} lượt đang thuê`
    : Number(user.pending_count || 0) > 0
      ? `${user.pending_count} yêu cầu chờ`
      : 'Chưa có phiên UC';
  return `
    <button class="gps-chip ${active}" type="button" data-gps-user="${user.user_id}">
      <strong>${escapeHtml(user.full_name)}</strong>
      <span>${escapeHtml(user.email)} · ${escapeHtml(user.customer_type === 'resident' ? 'Cư dân' : 'Khách thường')} · ${workflow}</span>
    </button>
  `;
}

function gpsStationChip(station) {
  const active = Number(state.gpsTargetStationId) === station.station_id ? 'active' : '';
  return `
    <button class="gps-chip ${active}" type="button" data-gps-station="${station.station_id}">
      <strong>${escapeHtml(station.station_name)}</strong>
      <span>${station.available_bikes || 0}/${station.total_bikes || 0} xe rảnh · bán kính ${station.station_radius_meters || 180} m</span>
    </button>
  `;
}

function gpsSessionsForMode() {
  return state.gpsSessions.filter((session) => session.flow === state.gpsMode);
}

function selectedGpsSession() {
  const sessions = gpsSessionsForMode();
  const byKey = sessions.find((session) => session.session_key === state.gpsSelectedSessionKey);
  if (byKey) return byKey;
  const byUser = sessions.find((session) => Number(session.customer_id) === Number(state.gpsSelectedCustomerId));
  if (byUser) return byUser;
  return state.gpsSelectedCustomerId ? null : sessions[0] || null;
}

function selectedGpsUser() {
  const id = Number(state.gpsSelectedCustomerId || selectedGpsSession()?.customer_id || 0);
  return state.gpsUsers.find((user) => Number(user.user_id) === id) || null;
}

function selectedGpsCustomerId() {
  return Number(state.gpsSelectedCustomerId || selectedGpsSession()?.customer_id || 0) || null;
}

function selectedGpsUserPosition() {
  const user = selectedGpsUser();
  const position = user?.position;
  if (!position) return null;
  const lat = Number(position.lat);
  const lng = Number(position.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function selectedGpsTargetStation() {
  const session = selectedGpsSession();
  return state.stations.find((station) => station.station_id === Number(state.gpsTargetStationId))
    || state.stations.find((station) => station.station_id === Number(session?.target_station_id))
    || state.stations[0]
    || null;
}

function gpsDistanceToTarget() {
  const target = selectedGpsTargetStation();
  const position = state.gpsBikePosition;
  if (!target || !position) return Infinity;
  return distanceMeters(position.lat, position.lng, target.latitude, target.longitude);
}

function gpsTargetRadiusMeters() {
  const target = selectedGpsTargetStation();
  return Number(target?.station_radius_meters || 180);
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
  const rangeOptions = [
    { value: '0.2', label: '200 m', detail: 'Chỉ bãi sát vị trí GPS', icon: 'ruler' },
    { value: '0.5', label: '500 m', detail: 'Phù hợp các bãi gần nhau', icon: 'ruler' },
    { value: '1', label: '1 km', detail: 'Mở rộng toàn khu gần nhất', icon: 'ruler' }
  ];
  return `
    <div class="search-workflow" aria-label="Điều kiện tìm bãi">
      ${filterDropdown('type', 'Loại xe', typeOptions, String(state.selectedTypeId), 'data-type-filter')}
      ${filterDropdown('range', 'Phạm vi', rangeOptions, String(state.stationRangeKm), 'data-station-range')}
    </div>
  `;
}

function filterDropdown(name, label, options, selectedValue, dataAttribute) {
  const selected = options.find((option) => String(option.value) === String(selectedValue)) || options[0];
  const menuId = `filter-${name}-menu`;
  return `
    <div class="control-group select-group select-group-${name}">
      <div class="pretty-select" data-select-root>
        <button class="pretty-select-trigger" type="button" data-select-trigger="${escapeAttr(name)}" aria-label="${escapeAttr(`${label}: ${selected.label}`)}" aria-expanded="false" aria-controls="${menuId}">
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
  const confirmed = state.activeRentals.filter((item) => item.return_confirmed_at).length;
  const ticket = state.lastTicket;
  return `
    <div class="return-pipeline">
      ${returnStep('bike', 'Nhận xe', hasActive ? `${state.activeRentals.length} lượt sẵn sàng xử lý` : 'Chưa có lượt đang thuê', hasActive)}
      ${returnStep('map-pin-check', 'Khách xác nhận bãi trả', confirmed ? `${confirmed}/${state.activeRentals.length} lượt đã xác nhận` : 'Chờ xác nhận từ khách', confirmed > 0)}
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

function opsActionErrorView(area) {
  if (!state.opsActionError || state.opsActionError.area !== area) return '';
  return `
    <div class="ops-action-error" role="alert">
      <img src="/vendor/icons/circle-alert.svg" alt="">
      <div>
        <strong>${area === 'pickup' ? 'Chưa thể giao xe' : 'Chưa thể xuất vé'}</strong>
        <span>${escapeHtml(state.opsActionError.message)}</span>
      </div>
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

function prettyInputSelect({ id, name = '', options = [], selectedValue = '', label = 'Chọn', disabled = false, compact = true }) {
  const normalizedValue = String(selectedValue ?? '');
  const fallback = { value: '', label: 'Không có dữ liệu', detail: 'Không thể chọn', icon: 'circle-alert' };
  const selected = options.find((option) => String(option.value) === normalizedValue) || options[0] || fallback;
  const isDisabled = disabled || !options.length;
  const menuId = `${id}-menu`;
  const inputName = name ? ` name="${escapeAttr(name)}"` : '';
  return `
    <div class="pretty-input-select ${compact ? 'table-select' : ''} ${isDisabled ? 'disabled' : ''}" data-pretty-input-select>
      <input type="hidden" id="${escapeAttr(id)}"${inputName} value="${escapeAttr(selected.value)}" aria-label="${escapeAttr(label)}">
      <div class="pretty-select ${compact ? 'compact-select' : ''} ${isDisabled ? 'disabled' : ''}" data-select-root>
        <button class="pretty-select-trigger ${compact ? 'compact-select-trigger' : ''}" type="button" data-select-trigger="${escapeAttr(id)}" aria-expanded="false" aria-controls="${escapeAttr(menuId)}" ${isDisabled ? 'disabled' : ''}>
          <span class="select-leading"><img src="/vendor/icons/${selected.icon || 'chevrons-up-down'}.svg" alt=""></span>
          <span class="select-value">
            <strong>${escapeHtml(selected.label)}</strong>
            <span>${escapeHtml(selected.detail || label)}</span>
          </span>
          <img class="select-chevron" src="/vendor/icons/chevron-down.svg" alt="">
        </button>
        <div id="${escapeAttr(menuId)}" class="pretty-select-menu compact-select-menu" role="listbox">
          ${(options.length ? options : [fallback]).map((option) => prettyInputSelectOption(id, option, selected.value)).join('')}
        </div>
      </div>
    </div>
  `;
}

function prettyInputSelectOption(targetId, option, selectedValue) {
  const active = String(option.value) === String(selectedValue);
  return `
    <button class="pretty-select-option compact-select-option ${active ? 'active' : ''}" type="button" role="option" aria-selected="${active}" data-pretty-select-option data-select-target="${escapeAttr(targetId)}" data-select-value="${escapeAttr(option.value)}" data-select-label="${escapeAttr(option.label)}" data-select-detail="${escapeAttr(option.detail || '')}" data-select-icon="${escapeAttr(option.icon || 'chevrons-up-down')}">
      <span class="select-leading"><img src="/vendor/icons/${option.icon || 'chevrons-up-down'}.svg" alt=""></span>
      <span class="select-option-copy">
        <strong>${escapeHtml(option.label)}</strong>
        <span>${escapeHtml(option.detail || '')}</span>
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
  return gpsDemoLocation();
}

function gpsDemoLocation() {
  if (state.gpsDemoPosition) {
    return { ...state.gpsDemoPosition, id: 'gps-demo', mode: 'gps', label: 'GPS hiện tại' };
  }
  return { ...DEFAULT_GPS_DEMO_LOCATION, label: 'GPS hiện tại' };
}

function locationPayload(location) {
  return {
    latitude: Number(location.lat),
    longitude: Number(location.lng),
    mode: location.mode || 'manual',
    label: locationShortLabel(location)
  };
}

function locationShortLabel(preset) {
  return ({
    'gps-demo': 'GPS hiện tại',
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
  if (!location || location.mode === 'saved' || location.mode === 'gps') return;
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

function selectedBikeTypeLabel() {
  const type = state.bikeTypes.find((item) => String(item.bike_type_id) === String(state.selectedTypeId));
  return type ? bikeTypeShortLabel(type.type_name) : '';
}

function stationAvailabilityLabel(station, { includeType = false } = {}) {
  const count = `${Number(station.available_bikes || 0)}/${Number(station.total_bikes || 0)} xe rảnh`;
  const typeLabel = includeType && state.selectedTypeId ? selectedBikeTypeLabel() : '';
  return typeLabel ? `${typeLabel} · ${count}` : count;
}

function stationCard(station) {
  const active = station.station_id === state.selectedStationId ? 'active' : '';
  return `
    <button class="station-card ${active}" type="button" data-station="${station.station_id}">
      <span class="station-title">${escapeHtml(station.station_name)}</span>
      <span>${escapeHtml(station.address)}</span>
      <span class="station-meta">${station.distance_km ?? '-'} km · ${escapeHtml(stationAvailabilityLabel(station, { includeType: true }))}</span>
    </button>
  `;
}

function stationMapView() {
  if (!state.stations.length) return emptyState('Chưa có bãi xe');
  const selected = currentLocation();
  const statusCopy = selected.mode === 'gps'
    ? (state.gpsDemoPosition ? 'GPS đang đồng bộ' : 'GPS mặc định')
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
        <small>${escapeHtml(stationAvailabilityLabel(station))}</small>
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
  stationUserMarker = user;
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
      ${escapeHtml(stationAvailabilityLabel(station, { includeType: true }))}
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
  if (stationUserTween) {
    stationUserTween.kill();
    stationUserTween = null;
  }
  stationUserMarker = null;
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
  }).setView(
    state.gpsMapView ? [state.gpsMapView.lat, state.gpsMapView.lng] : [mapCenter.lat, mapCenter.lng],
    state.gpsMapView?.zoom || 15
  );

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
      radius: gpsTargetRadiusMeters(),
      color: '#1596c2',
      fillColor: '#1596c2',
      fillOpacity: 0.08,
      weight: 2
    }).addTo(gpsMapInstance);
  }

  if (!selectedGpsCustomerId()) {
    if (!state.gpsMapView) {
      gpsMapInstance.fitBounds(boundsForGpsDemo(roadLatLngs), { padding: [28, 28], maxZoom: 16 });
      rememberGpsMapView();
    }
    return;
  }

  const startPoint = routePath[0] || state.gpsBikePosition;
  gpsBikeMarker = window.L.marker([startPoint.lat, startPoint.lng], {
    draggable: true,
    icon: window.L.divIcon({
      className: 'bike-gps-pin',
      html: `<span><img src="/vendor/icons/user-round.svg" alt=""></span><strong>${escapeHtml(selectedGpsUser()?.full_name || 'GPS khách')}</strong>`,
      iconSize: [104, 36],
      iconAnchor: [18, 18]
    })
  }).addTo(gpsMapInstance);
  gpsMapInstance.on('moveend zoomend', rememberGpsMapView);
  gpsBikeMarker.on('drag', () => {
    const latLng = gpsBikeMarker.getLatLng();
    const snapped = snapToRoad(latLng.lat, latLng.lng);
    gpsBikeMarker.setLatLng([snapped.lat, snapped.lng]);
  });
  gpsBikeMarker.on('dragend', () => {
    rememberGpsMapView();
    const latLng = gpsBikeMarker.getLatLng();
    const snapped = snapToRoad(latLng.lat, latLng.lng);
    state.gpsRoutePath = buildRoadRoute(state.gpsBikePosition, snapped);
    state.gpsBikePosition = snapped;
    void persistGpsDemoPosition(snapped);
    notify('Đã đưa GPS người dùng về tuyến đường hợp lệ');
    render();
  });

  const bounds = boundsForGpsDemo(roadLatLngs);
  if (!state.gpsMapView) {
    gpsMapInstance.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
    rememberGpsMapView();
  }
  animateGpsMarkerAlongRoute(routePath);
}

function boundsForGpsDemo(roadLatLngs) {
  return window.L.latLngBounds([
    ...roadLatLngs,
    ...state.stations.map((station) => [Number(station.latitude), Number(station.longitude)])
  ]);
}

function rememberGpsMapView() {
  if (!gpsMapInstance) return;
  const center = gpsMapInstance.getCenter();
  state.gpsMapView = {
    lat: center.lat,
    lng: center.lng,
    zoom: gpsMapInstance.getZoom()
  };
}

function animateGpsMarkerAlongRoute(path) {
  if (!gpsBikeMarker || !path.length) return;
  const route = normalizeRoutePath(path);
  const lastPoint = route[route.length - 1];
  if (route.length < 2 || prefersReducedMotion() || !gsap) {
    gpsBikeMarker.setLatLng([lastPoint.lat, lastPoint.lng]);
    void queuePersistGpsDemoPosition(lastPoint);
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
        return {
          lat: start.lat + (end.lat - start.lat) * segmentProgress,
          lng: start.lng + (end.lng - start.lng) * segmentProgress
        };
      }
      traveled += segmentDistance;
    }
    gpsBikeMarker.setLatLng([lastPoint.lat, lastPoint.lng]);
    return lastPoint;
  };

  setMarkerProgress(0);
  const customerId = selectedGpsCustomerId();
  let lastPersistAt = 0;
  const streamPoint = (point, force = false) => {
    if (!point || !customerId) return;
    const nowMs = performance.now();
    if (!force && nowMs - lastPersistAt < GPS_DEMO_STREAM_INTERVAL_MS) return;
    lastPersistAt = nowMs;
    void queuePersistGpsDemoPosition(point, customerId);
  };
  const progressTracker = { value: 0 };
  gpsRouteTween = gsap.to(progressTracker, {
    value: 1,
    duration: Math.min(3.2, Math.max(0.9, totalDistance / 180)),
    ease: 'none',
    overwrite: true,
    onUpdate: () => streamPoint(setMarkerProgress(progressTracker.value)),
    onComplete: () => {
      const finalPoint = setMarkerProgress(1);
      streamPoint(finalPoint, true);
    }
  });
}

function disposeGpsDemoMap() {
  if (gpsRouteTween) {
    gpsRouteTween.kill();
    gpsRouteTween = null;
  }
  gpsBikeMarker = null;
  if (!gpsMapInstance) return;
  rememberGpsMapView();
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
      <div>
        <strong>${escapeHtml(item.bike_code)}</strong>
        <span class="rental-countdown" data-rental-countdown data-planned-end-at="${escapeAttr(item.planned_end_at)}">${rentalCountdownText(item.planned_end_at)}</span>
        <span>Trả dự kiến ${formatTime(item.planned_end_at)} · cọc ${money(item.deposit_amount)}</span>
        <span class="cell-subtext">${item.return_confirmed_at ? `Đã xác nhận trả tại ${escapeHtml(item.return_station || selectedStationName())}` : `Chưa xác nhận trả · bãi đang chọn: ${selectedStationName()}`}</span>
      </div>
      <button class="secondary small" type="button" data-confirm-return="${item.rental_id}">
        <img src="/vendor/icons/map-pin-check.svg" alt="">${item.return_confirmed_at ? 'Đổi bãi trả' : 'Xác nhận trả'}
      </button>
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

function rentalLateFeeNote() {
  const lateFee = state.demoClock?.lateFeePer30Minutes || 30000;
  return `
    <div class="rental-fee-note" role="note">
      <img src="/vendor/icons/timer.svg" alt="">
      <p>
        <strong>Phụ thu trả muộn</strong>
        <span>${money(lateFee)} cho mỗi 30 phút quá hạn; phần lẻ được làm tròn lên. Giảm cư dân 40% chỉ áp dụng cho phí thuê cơ bản.</span>
      </p>
    </div>
  `;
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

function demoClockNowMs() {
  const clockMs = Date.parse(state.demoClock?.currentTime || '');
  if (!Number.isFinite(clockMs)) return Date.now();
  return clockMs + Math.max(0, Date.now() - demoClockClientSyncedAtMs);
}

function rentalCountdownInfo(plannedEndAt) {
  const plannedEndMs = Date.parse(plannedEndAt || '');
  if (!Number.isFinite(plannedEndMs)) {
    return { overdue: false, seconds: 0, fee: 0 };
  }
  const deltaMs = plannedEndMs - demoClockNowMs();
  if (deltaMs >= 0) {
    return { overdue: false, seconds: Math.max(0, Math.ceil(deltaMs / 1000)), fee: 0 };
  }
  const seconds = Math.max(1, Math.floor(Math.abs(deltaMs) / 1000));
  const lateFee = state.demoClock?.lateFeePer30Minutes || 30000;
  return {
    overdue: true,
    seconds,
    fee: Math.ceil(seconds / LATE_FEE_BLOCK_SECONDS) * lateFee
  };
}

function rentalCountdownText(plannedEndAt) {
  const info = rentalCountdownInfo(plannedEndAt);
  const duration = formatCountdownDuration(info.seconds);
  if (info.overdue) return `Quá hạn ${duration} · tạm tính phụ thu ${money(info.fee)}`;
  return `Còn ${duration}`;
}

function updateRentalCountdownNodes() {
  document.querySelectorAll('[data-rental-countdown]').forEach((node) => {
    const info = rentalCountdownInfo(node.dataset.plannedEndAt);
    node.textContent = info.overdue
      ? `Quá hạn ${formatCountdownDuration(info.seconds)} · tạm tính phụ thu ${money(info.fee)}`
      : `Còn ${formatCountdownDuration(info.seconds)}`;
    node.classList.toggle('is-overdue', info.overdue);
  });
}

function formatCountdownDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds || 0)));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, '0')).join(':');
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
  return Math.max(12, Math.round((number / Math.max(1, Number(maxValue || 1))) * 100));
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
                  ${documentTypeSelect(`doc-type-${item.request_id}`)}
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
  return prettyInputSelect({
    id: `exchange-bike-${request.request_id}`,
    label: `Xe đổi cho REQ${request.request_id}`,
    selectedValue: options[0]?.bike_id || '',
    options: options.map((bike) => ({
      value: bike.bike_id,
      label: bike.bike_code,
      detail: `${bikeTypeShortLabel(bike.type_name)} · ${bike.station_name}`,
      icon: 'bike'
    })),
    disabled: !options.length
  });
}

function activeRentalsTable() {
  if (!state.activeRentals.length) return emptyState('Không có xe đang thuê');
  return `
    <div class="table-wrap return-table-wrap">
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
              <td data-label="Bãi trả">${stationSelect(`return-station-${item.rental_id}`, item.return_station_id || item.pickup_station_id)}<span class="cell-subtext">${item.return_confirmed_at ? `Khách xác nhận ${escapeHtml(item.return_station || '')}` : 'Chờ khách xác nhận'}</span></td>
              <td data-label="Giờ trả"><input id="returned-at-${item.rental_id}" type="datetime-local" value="${toDatetimeLocal(defaultReturnTime(item))}" aria-label="Giờ trả RENT${item.rental_id}"></td>
              <td data-label="Tình trạng">${rentalConditionSelect(`condition-${item.rental_id}`)}</td>
              <td data-label="Ghi chú"><input id="condition-note-${item.rental_id}" value="Nhận xe tại bãi trả" aria-label="Ghi chú tình trạng RENT${item.rental_id}"></td>
              <td class="actions-cell" data-label=""><button class="primary small ${item.return_confirmed_at ? '' : 'is-soft-disabled'}" data-return="${item.rental_id}" data-return-ready="${item.return_confirmed_at ? 'true' : 'false'}" title="${item.return_confirmed_at ? 'Xuất vé' : 'Chờ khách xác nhận vị trí trả xe'}"><img src="/vendor/icons/receipt-text.svg" alt="">Xuất vé</button></td>
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
              <td data-label="Trạng thái">${bikeStatusSelect(`bike-status-${bike.bike_id}`, bike.bike_status)}</td>
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
          <div class="field-block"><span>Trạng thái</span>${stationStatusSelect('new-station-status', 'active')}</div>
          <button class="secondary" type="submit"><img src="/vendor/icons/map-pin-plus.svg" alt="">Thêm bãi</button>
        </form>
        <form id="bike-form" class="form-grid compact">
          <h3>Xe</h3>
          <label>Mã xe<input name="bikeCode" required></label>
          <div class="field-block"><span>Bãi</span>${stationSelect('new-bike-station')}</div>
          <div class="field-block"><span>Loại xe</span>${bikeTypeSelect('new-bike-type')}</div>
          <div class="field-block"><span>Trạng thái</span>${bikeStatusSelect('new-bike-status', 'available')}</div>
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
        <div class="field-block"><span>Trạng thái</span>${accountStatusSelect('user-status-value')}</div>
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
  bindThemeEvents();
  document.querySelector('#refresh-gps-demo')?.addEventListener('click', async () => {
    await runAction(async () => {
      await refreshGpsDemoDataWithLoading();
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
        await refreshGpsDemoDataWithLoading();
        render();
      }, 'Đã đăng nhập bảng điều khiển demo');
    });
  });
  document.querySelectorAll('[data-clock-advance]').forEach((button) => {
    button.addEventListener('click', async () => {
      const advanceMinutes = Number(button.dataset.clockAdvance);
      await runAction(async () => {
        setDemoClock(await api('/api/demo-clock', {
          method: 'POST',
          body: { advanceMinutes }
        }));
        await refreshGpsDemoDataWithLoading();
        render();
      }, `Đã tua giờ +${advanceMinutes} phút`);
    });
  });
  document.querySelector('[data-clock-reset]')?.addEventListener('click', async () => {
    await runAction(async () => {
      setDemoClock(await api('/api/demo-clock', {
        method: 'POST',
        body: { reset: true }
      }));
      await refreshGpsDemoDataWithLoading();
      render();
    }, 'Đã đưa đồng hồ về giờ thật');
  });
  document.querySelectorAll('[data-gps-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.gpsMode = button.dataset.gpsMode;
      state.gpsRoutePath = [];
      const session = gpsSessionsForMode()[0] || null;
      state.gpsSelectedSessionKey = session?.session_key || null;
      state.gpsSelectedCustomerId = session?.customer_id || state.gpsSelectedCustomerId;
      state.gpsTargetStationId = session?.target_station_id || state.gpsTargetStationId;
      state.gpsBikePosition = selectedGpsUserPosition() || state.gpsBikePosition;
      render();
    });
  });
  document.querySelector('#gps-user-query')?.addEventListener('input', (event) => {
    state.gpsUserQuery = event.target.value;
    render();
    window.requestAnimationFrame(() => {
      const field = document.querySelector('#gps-user-query');
      field?.focus({ preventScroll: true });
      field?.setSelectionRange(field.value.length, field.value.length);
    });
  });
  document.querySelectorAll('[data-gps-user]').forEach((button) => {
    button.addEventListener('click', () => {
      state.gpsSelectedCustomerId = Number(button.dataset.gpsUser);
      const session = gpsSessionsForMode().find((item) => Number(item.customer_id) === Number(state.gpsSelectedCustomerId));
      state.gpsSelectedSessionKey = session?.session_key || null;
      state.gpsTargetStationId = session?.target_station_id || state.gpsTargetStationId;
      state.gpsRoutePath = [];
      state.gpsBikePosition = selectedGpsUserPosition() || offsetFromStation(selectedGpsTargetStation(), 55);
      render();
    });
  });
  document.querySelectorAll('[data-gps-session]').forEach((button) => {
    button.addEventListener('click', () => {
      state.gpsSelectedSessionKey = button.dataset.gpsSession;
      const session = selectedGpsSession();
      if (session) {
        state.gpsSelectedCustomerId = session.customer_id;
        state.gpsTargetStationId = session.target_station_id;
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
      if (!selectedGpsCustomerId()) return;
      setGpsBikeNearTarget(button.dataset.gpsSnap === 'near');
      render();
    });
  });
}

function bindPasswordToggles() {
  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.closest('.password-field')?.querySelector('input');
      if (!field) return;
      const isVisible = field.type === 'text';
      field.type = isVisible ? 'password' : 'text';
      button.title = isVisible ? 'Hiện mật khẩu' : 'Ẩn mật khẩu';
      button.setAttribute('aria-label', button.title);
      const icon = button.querySelector('img');
      if (icon) icon.src = `/vendor/icons/${isVisible ? 'eye' : 'eye-off'}.svg`;
      field.focus({ preventScroll: true });
    });
  });
}

function bindAuthEvents() {
  bindThemeEvents();
  bindPasswordToggles();
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

  const registerForm = document.querySelector('#register-form');
  bindInlineValidation(registerForm, {
    fullName: 'Vui lòng nhập họ tên khách thuê.',
    email: 'Vui lòng nhập email hợp lệ.',
    phone: 'Vui lòng nhập số điện thoại Việt Nam hợp lệ.',
    password: 'Mật khẩu cần tối thiểu 8 ký tự, gồm chữ và số.',
    identityNumber: 'Vui lòng nhập CCCD/CMND 9 hoặc 12 chữ số.',
    address: 'Vui lòng nhập địa chỉ liên hệ.'
  });
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    await runAction(async () => {
      const payload = await api('/api/auth/register', { method: 'POST', body });
      rememberRecentDemoAccount({
        email: payload.user.email,
        password: body.password,
        label: `Mới đăng ký · ${payload.user.full_name}`
      });
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
    button.addEventListener('click', () => {
      const form = document.querySelector('#login-form');
      const emailField = form?.querySelector('input[name="email"]');
      const passwordInput = form?.querySelector('input[name="password"]');
      if (!emailField || !passwordInput) return;
      emailField.value = button.dataset.demoEmail || '';
      passwordInput.value = button.dataset.demoPassword || '';
      document.querySelectorAll('[data-demo-email]').forEach((item) => item.classList.toggle('active', item === button));
      form.querySelector('button[type="submit"]')?.focus({ preventScroll: true });
    });
  });
}

function bindInlineValidation(form, messages = {}) {
  if (!form) return;
  form.addEventListener('invalid', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
    event.preventDefault();
    if (form.dataset.validationNotified === 'true') return;
    form.dataset.validationNotified = 'true';
    window.setTimeout(() => {
      delete form.dataset.validationNotified;
    }, 100);
    form.querySelectorAll('.field-invalid').forEach((input) => input.classList.remove('field-invalid'));
    field.classList.add('field-invalid');
    const message = messages[field.name] || field.validationMessage || 'Vui lòng kiểm tra lại thông tin bắt buộc.';
    notify(message, true);
    field.focus({ preventScroll: true });
  }, true);

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('field-invalid'));
    field.addEventListener('change', () => field.classList.remove('field-invalid'));
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
  bindThemeEvents();
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
  if (railScrollHandler) {
    window.removeEventListener('scroll', railScrollHandler);
    railScrollHandler = null;
  }
  document.querySelectorAll('[data-rail-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.querySelector(`#${button.dataset.railTarget}`);
      if (!target) return;
      railPreferredTargetId = button.dataset.railTarget;
      setActiveRailTarget(railPreferredTargetId);
      target.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  });
  if (!railIntentEventsBound) {
    railIntentEventsBound = true;
    window.addEventListener('wheel', clearRailPreferredTarget, { passive: true });
    window.addEventListener('touchstart', clearRailPreferredTarget, { passive: true });
    window.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
        clearRailPreferredTarget();
      }
    });
  }
  railScrollHandler = () => updateActiveRailItem();
  window.addEventListener('scroll', railScrollHandler, { passive: true });
  updateActiveRailItem();
}

function updateActiveRailItem() {
  const items = [...document.querySelectorAll('[data-rail-target]')];
  if (!items.length) return;
  const viewportTop = 96;
  const viewportBottom = window.innerHeight;
  const sections = items
    .map((item) => {
      const target = document.querySelector(`#${item.dataset.railTarget}`);
      const rect = target?.getBoundingClientRect();
      const visibleHeight = rect
        ? Math.max(0, Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop))
        : 0;
      return { item, target, rect, visibleHeight };
    })
    .filter(({ target }) => target);
  if (!sections.length) return;

  const preferred = sections.find(({ item }) => item.dataset.railTarget === railPreferredTargetId);
  if (preferred) {
    setActiveRailTarget(preferred.item.dataset.railTarget);
    return;
  }
  if (railPreferredTargetId) railPreferredTargetId = null;

  const active = sections.reduce((best, section) => {
    if (!best || section.visibleHeight > best.visibleHeight) return section;
    if (section.visibleHeight === best.visibleHeight && section.rect.top < best.rect.top) return section;
    return best;
  }, null) || sections[0];
  setActiveRailTarget(active.item.dataset.railTarget);
}

function setActiveRailTarget(targetId) {
  document.querySelectorAll('[data-rail-target]').forEach((item) => {
    const isActive = item.dataset.railTarget === targetId;
    item.classList.toggle('active', isActive);
    if (isActive) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

function clearRailPreferredTarget() {
  railPreferredTargetId = null;
}

function resetWorkspaceState() {
  state.selectedTypeId = '';
  state.fleetQuery = '';
  state.reportPeriod = 'day';
  state.reportStationId = '';
  state.reportBikeId = '';
  state.lastTicket = null;
  state.opsActionError = null;
}

function bindCustomSelectEvents() {
  document.querySelectorAll('[data-select-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const root = trigger.closest('[data-select-root]');
      const isOpen = root.classList.contains('open');
      const shouldOpen = !isOpen;
      closeCustomSelects(root);
      root.classList.toggle('open', shouldOpen);
      trigger.setAttribute('aria-expanded', String(shouldOpen));
      if (shouldOpen) updateCustomSelectMenuBounds(root);
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
  window.addEventListener('resize', () => {
    document.querySelectorAll('[data-select-root].open').forEach(updateCustomSelectMenuBounds);
  });
}

function updateCustomSelectMenuBounds(root) {
  const menu = root?.querySelector('.pretty-select-menu');
  if (!menu) return;
  menu.style.removeProperty('--select-menu-max-height');
  if (!window.matchMedia('(max-width: 760px)').matches) return;

  window.requestAnimationFrame(() => {
    const rail = document.querySelector('.command-rail');
    const railRect = rail?.getBoundingClientRect();
    const railIsFixed = rail && getComputedStyle(rail).position === 'fixed';
    const bottomLimit = railRect && railIsFixed ? railRect.top - 10 : window.innerHeight - 12;
    const menuTop = menu.getBoundingClientRect().top;
    const availableHeight = Math.floor(bottomLimit - menuTop);
    if (availableHeight > 80) {
      menu.style.setProperty('--select-menu-max-height', `${availableHeight}px`);
    }
  });
}

function bindPrettyInputSelects() {
  document.querySelectorAll('[data-pretty-select-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.selectTarget);
      const root = button.closest('[data-select-root]');
      const trigger = root?.querySelector('[data-select-trigger]');
      const triggerIcon = trigger?.querySelector('.select-leading img');
      const triggerLabel = trigger?.querySelector('.select-value strong');
      const triggerDetail = trigger?.querySelector('.select-value span');
      if (!input) return;

      input.value = button.dataset.selectValue || '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      if (triggerIcon) triggerIcon.src = `/vendor/icons/${button.dataset.selectIcon || 'chevrons-up-down'}.svg`;
      if (triggerLabel) triggerLabel.textContent = button.dataset.selectLabel || '';
      if (triggerDetail) triggerDetail.textContent = button.dataset.selectDetail || '';

      root?.querySelectorAll('[data-pretty-select-option]').forEach((option) => {
        const active = option === button;
        option.classList.toggle('active', active);
        option.setAttribute('aria-selected', String(active));
      });
      closeCustomSelects();
    });
  });
}

function closeCustomSelects(exceptRoot = null) {
  document.querySelectorAll('[data-select-root].open').forEach((root) => {
    if (exceptRoot && root === exceptRoot) return;
    root.classList.remove('open');
    root.querySelector('.pretty-select-menu')?.style.removeProperty('--select-menu-max-height');
    root.querySelector('[data-select-trigger]')?.setAttribute('aria-expanded', 'false');
  });
}

function bindCustomerEvents() {
  bindCustomSelectEvents();
  bindRentDurationDropdowns();
  document.querySelectorAll('[data-station]').forEach((button) => {
    button.addEventListener('click', () => selectStation(Number(button.dataset.station)));
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
      state.selectedStationId = null;
      await runAction(async () => {
        await refreshData();
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
            requestedDurationMinutes: Number(duration),
            userLocation: locationPayload(currentLocation())
          }
        });
        await refreshData();
        render();
      }, 'Đã gửi yêu cầu thuê xe');
    });
  });
  document.querySelectorAll('[data-confirm-return]').forEach((button) => {
    button.addEventListener('click', async () => {
      const rentalId = Number(button.dataset.confirmReturn);
      await runAction(async () => {
        await api(`/api/customer/rentals/${rentalId}/confirm-return`, {
          method: 'POST',
          body: {
            returnStationId: state.selectedStationId,
            userLocation: locationPayload(currentLocation())
          }
        });
        await refreshData();
        render();
      }, 'Đã xác nhận vị trí trả xe');
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
  bindPrettyInputSelects();
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
      await runOpsAction('pickup', async () => {
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
      if (button.dataset.returnReady !== 'true') {
        showOpsActionError('return', 'Khách cần xác nhận vị trí trả xe trong bán kính bãi trả trước khi nhân sự xuất vé.');
        return;
      }
      await runOpsAction('return', async () => {
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
        return ticket;
      }, (ticket) => `Vé TCK${ticket.ticket_id}: ${money(ticket.total_amount)}`);
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

async function runOpsAction(area, action, message) {
  state.opsActionError = null;
  try {
    const result = await action();
    const nextMessage = typeof message === 'function' ? message(result) : message;
    if (nextMessage) notify(nextMessage);
    return result;
  } catch (error) {
    showOpsActionError(area, operationReason(area, error.message));
    return null;
  }
}

function showOpsActionError(area, message) {
  state.opsActionError = { area, message };
  render();
  notify(message, true);
}

function operationReason(area, rawMessage = '') {
  const message = String(rawMessage || '').trim();
  const rules = [
    [/Deposit amount must be exactly 200000/i, 'Tiền cọc phải đúng 200.000 đ.'],
    [/Identity document does not match/i, 'Số giấy tờ không khớp hồ sơ khách hàng.'],
    [/Pending rental request not found/i, 'Yêu cầu nhận xe không còn ở trạng thái chờ xử lý.'],
    [/Rental request has expired/i, 'Yêu cầu nhận xe đã quá hạn giữ chỗ.'],
    [/Bike cannot be handed over/i, 'Xe không còn sẵn sàng tại bãi nhận đã chọn. Hãy đổi sang xe khác.'],
    [/Handover location must be within/i, 'GPS hiện tại của khách nằm ngoài bán kính phục vụ của bãi nhận. Hãy kéo user gần bãi trong /gd rồi giao xe lại.'],
    [/Customer must confirm return/i, 'Khách cần xác nhận vị trí trả xe trong bán kính bãi trả trước khi nhân sự xuất vé.'],
    [/Return station must match/i, 'Bãi trả đang chọn không khớp bãi khách đã xác nhận.'],
    [/Return station must be active/i, 'Bãi trả không còn hoạt động.'],
    [/Return location must be within/i, 'Vị trí khách xác nhận trả xe nằm ngoài bán kính phục vụ của bãi trả.'],
    [/Staff can only process records/i, 'Tài khoản nhân sự chỉ được xử lý bãi được phân công.'],
    [/Invalid time range|Invalid returned time|returnedAt/i, 'Thời gian trả xe không hợp lệ.']
  ];
  const match = rules.find(([pattern]) => pattern.test(message));
  if (match) return match[1];
  return message || (area === 'pickup' ? 'Không thể giao xe do điều kiện nhận xe chưa hợp lệ.' : 'Không thể xuất vé do điều kiện trả xe chưa hợp lệ.');
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

function availableDemoAccounts() {
  const recentEmails = new Set(state.recentDemoAccounts.map((account) => account.email.toLowerCase()));
  return [
    ...state.recentDemoAccounts,
    ...DEMO_ACCOUNTS.filter((account) => !recentEmails.has(account.email.toLowerCase()))
  ];
}

function rememberRecentDemoAccount(account) {
  const email = String(account.email || '').trim().toLowerCase();
  if (!email || !account.password) return;
  state.recentDemoAccounts = [
    { email, password: String(account.password), label: String(account.label || email) },
    ...state.recentDemoAccounts.filter((item) => item.email.toLowerCase() !== email)
  ].slice(0, 3);
}

function demoButton({ email, password, label }) {
  return `
    <button class="demo-button" type="button" data-demo-email="${escapeAttr(email)}" data-demo-password="${escapeAttr(password)}" title="Điền ${escapeAttr(email)} vào form đăng nhập">
      <span class="demo-account-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(email)}</small></span>
      <span class="demo-fill-hint">Điền</span>
    </button>
  `;
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

function stationSelect(id, selectedId, name = 'stationId') {
  return prettyInputSelect({
    id,
    name,
    label: 'Bãi xe',
    selectedValue: selectedId ?? state.stations[0]?.station_id ?? '',
    options: state.stations.map((station) => ({
      value: station.station_id,
      label: station.station_name,
      detail: station.address || `${station.available_bikes || 0} xe sẵn sàng`,
      icon: 'map-pin'
    }))
  });
}

function bikeTypeSelect(id, selectedId, name = 'bikeTypeId') {
  return prettyInputSelect({
    id,
    name,
    label: 'Loại xe',
    selectedValue: selectedId ?? state.bikeTypes[0]?.bike_type_id ?? '',
    options: state.bikeTypes.map((type) => ({
      value: type.bike_type_id,
      label: type.type_name,
      detail: bikeTypeShortLabel(type.type_name),
      icon: 'bike'
    }))
  });
}

function stationStatusSelect(id, selectedStatus = 'active', name = 'stationStatus') {
  return prettyInputSelect({
    id,
    name,
    label: 'Trạng thái bãi',
    selectedValue: selectedStatus,
    options: [
      { value: 'active', label: 'Hoạt động', detail: 'Cho nhận và trả xe', icon: 'badge-check' },
      { value: 'paused', label: 'Tạm ngưng', detail: 'Tạm dừng phục vụ', icon: 'pause-circle' },
      { value: 'maintenance', label: 'Bảo trì', detail: 'Đang kiểm tra bãi', icon: 'wrench' }
    ]
  });
}

function documentTypeSelect(id) {
  return prettyInputSelect({
    id,
    label: 'Loại giấy tờ',
    selectedValue: 'CCCD',
    options: [
      { value: 'CCCD', label: 'CCCD', detail: 'Căn cước công dân', icon: 'id-card' },
      { value: 'CMND', label: 'CMND', detail: 'Chứng minh nhân dân', icon: 'badge' },
      { value: 'Passport', label: 'Hộ chiếu', detail: 'Giấy tờ thay thế', icon: 'book-user' }
    ]
  });
}

function rentalConditionSelect(id) {
  return prettyInputSelect({
    id,
    label: 'Tình trạng xe',
    selectedValue: 'available',
    options: [
      { value: 'available', label: 'Sẵn sàng', detail: 'Đưa về đội xe rảnh', icon: 'badge-check' },
      { value: 'broken', label: 'Cần sửa', detail: 'Chuyển sang kiểm tra', icon: 'wrench' }
    ]
  });
}

function bikeStatusSelect(id, selectedStatus = 'available', name = 'bikeStatus') {
  return prettyInputSelect({
    id,
    name,
    label: 'Trạng thái xe',
    selectedValue: selectedStatus,
    options: [
      { value: 'available', label: 'Sẵn sàng', detail: 'Có thể thuê', icon: 'badge-check' },
      { value: 'rented', label: 'Đang thuê', detail: 'Đang có lượt chạy', icon: 'timer' },
      { value: 'broken', label: 'Cần sửa', detail: 'Khóa khỏi đội rảnh', icon: 'wrench' }
    ]
  });
}

function accountStatusSelect(id, selectedStatus = 'active', name = 'status') {
  return prettyInputSelect({
    id,
    name,
    label: 'Trạng thái tài khoản',
    selectedValue: selectedStatus,
    options: [
      { value: 'active', label: 'Mở khóa', detail: 'Cho phép đăng nhập', icon: 'shield-check' },
      { value: 'blocked', label: 'Khóa tài khoản', detail: 'Chặn thao tác thuê xe', icon: 'ban' }
    ]
  });
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
    verified: 'Hợp lệ',
    pending: 'Chờ bổ sung',
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
