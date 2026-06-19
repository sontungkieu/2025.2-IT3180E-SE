const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createServer } = require('../server/app');

function startTestServer() {
  const dir = mkdtempSync(path.join(tmpdir(), 'ecopark-test-'));
  const dbPath = path.join(dir, 'test.sqlite');
  const server = createServer({ dbPath, seed: true });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        baseUrl: `http://${address.address}:${address.port}`,
        dir,
        server,
        async close() {
          await new Promise((done) => server.close(done));
          server.closeDatabase();
          rmSync(dir, { recursive: true, force: true });
        }
      });
    });
  });
}

function client(baseUrl) {
  let cookie = '';
  return {
    async request(pathname, { method = 'GET', body } = {}) {
      const response = await fetch(`${baseUrl}${pathname}`, {
        method,
        headers: {
          ...(cookie ? { Cookie: cookie } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        body: body ? JSON.stringify(body) : undefined
      });
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        cookie = setCookie.split(';')[0];
      }
      const payload = await response.json();
      return { response, payload };
    }
  };
}

function registrationPayload(overrides = {}) {
  return {
    fullName: 'Pham Thanh Mai',
    email: `mai-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`,
    phone: '0911111111',
    password: 'secret123',
    identityNumber: '001203999888',
    address: 'Ecopark',
    ...overrides
  };
}

test('registration validates duplicate email', async () => {
  const fixture = await startTestServer();
  const api = client(fixture.baseUrl);
  try {
    const first = await api.request('/api/auth/register', {
      method: 'POST',
      body: registrationPayload({
        email: 'mai@example.test',
        phone: '0911111111',
        identityNumber: '001203999888',
      })
    });
    assert.equal(first.response.status, 201);

    const second = await api.request('/api/auth/register', {
      method: 'POST',
      body: registrationPayload({
        email: 'mai@example.test',
        phone: '0911111112',
        identityNumber: '001203999889'
      })
    });
    assert.equal(second.response.status, 409);
  } finally {
    await fixture.close();
  }
});

test('registration validates name phone and identity inputs', async () => {
  const fixture = await startTestServer();
  try {
    const invalidCases = [
      {
        name: 'weak password',
        body: registrationPayload({ password: 'secret1', phone: '0911111120', identityNumber: '001203999820' }),
        status: 400,
        message: /Mật khẩu/
      },
      {
        name: 'digits in full name',
        body: registrationPayload({ fullName: 'Nguyen 123', phone: '0911111121', identityNumber: '001203999821' }),
        status: 400,
        message: /Họ tên/
      },
      {
        name: 'invalid phone format',
        body: registrationPayload({ phone: '12345', identityNumber: '001203999822' }),
        status: 400,
        message: /Số điện thoại/
      },
      {
        name: 'invalid identity format',
        body: registrationPayload({ phone: '0911111123', identityNumber: 'ABC123' }),
        status: 400,
        message: /CCCD\/CMND/
      },
      {
        name: 'duplicate seeded phone',
        body: registrationPayload({ phone: '0900000003', identityNumber: '001203999824' }),
        status: 409,
        message: /Số điện thoại/
      },
      {
        name: 'duplicate seeded identity',
        body: registrationPayload({ phone: '0911111125', identityNumber: '001203000111' }),
        status: 409,
        message: /CCCD\/CMND/
      }
    ];

    for (const testCase of invalidCases) {
      const api = client(fixture.baseUrl);
      const result = await api.request('/api/auth/register', {
        method: 'POST',
        body: testCase.body
      });
      assert.equal(result.response.status, testCase.status, testCase.name);
      assert.match(result.payload.error, testCase.message, testCase.name);
    }

    const api = client(fixture.baseUrl);
    const normalizedPhone = await api.request('/api/auth/register', {
      method: 'POST',
      body: registrationPayload({
        fullName: 'Do Minh Chau',
        email: 'chau@example.test',
        phone: '+84912345678',
        identityNumber: '001203999826'
      })
    });
    assert.equal(normalizedPhone.response.status, 201);
    assert.equal(normalizedPhone.payload.user.phone, '0912345678');
  } finally {
    await fixture.close();
  }
});

test('legacy password hashes log in and are upgraded to PBKDF2', async () => {
  const fixture = await startTestServer();
  const api = client(fixture.baseUrl);
  try {
    const legacyHash = crypto.createHash('sha256').update('customer123').digest('hex');
    fixture.server.db.prepare("UPDATE users SET password_hash = ? WHERE email = 'customer@ecopark.test'").run(legacyHash);
    const login = await api.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer@ecopark.test', password: 'customer123' }
    });
    assert.equal(login.response.status, 200);
    const upgraded = fixture.server.db.prepare("SELECT password_hash FROM users WHERE email = 'customer@ecopark.test'").get().password_hash;
    assert.match(upgraded, /^pbkdf2_sha256\$/);
  } finally {
    await fixture.close();
  }
});

test('new customers verify email before creating rental requests', async () => {
  const fixture = await startTestServer();
  const api = client(fixture.baseUrl);
  try {
    const registered = await api.request('/api/auth/register', {
      method: 'POST',
      body: registrationPayload({
        email: 'verify@example.test',
        phone: '0911111130',
        identityNumber: '001203999830'
      })
    });
    assert.equal(registered.response.status, 201);
    assert.ok(registered.payload.demoCode);

    const blocked = await api.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 2, bikeId: 3, requestedDurationMinutes: 60 }
    });
    assert.equal(blocked.response.status, 403);
    assert.match(blocked.payload.error, /Email/);

    const verified = await api.request('/api/auth/verify-email', {
      method: 'POST',
      body: { code: registered.payload.demoCode }
    });
    assert.equal(verified.response.status, 200);
    assert.ok(verified.payload.user.email_verified_at);

    const request = await api.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 2, bikeId: 3, requestedDurationMinutes: 60 }
    });
    assert.equal(request.response.status, 201);
  } finally {
    await fixture.close();
  }
});

test('password reset demo code updates login credentials', async () => {
  const fixture = await startTestServer();
  const api = client(fixture.baseUrl);
  try {
    const requested = await api.request('/api/auth/request-password-reset', {
      method: 'POST',
      body: { email: 'customer@ecopark.test' }
    });
    assert.equal(requested.response.status, 200);
    assert.ok(requested.payload.demoCode);

    const reset = await api.request('/api/auth/reset-password', {
      method: 'POST',
      body: { email: 'customer@ecopark.test', code: requested.payload.demoCode, password: 'newpass123' }
    });
    assert.equal(reset.response.status, 200);

    const oldLogin = await api.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer@ecopark.test', password: 'customer123' }
    });
    assert.equal(oldLogin.response.status, 401);
    const newLogin = await api.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer@ecopark.test', password: 'newpass123' }
    });
    assert.equal(newLogin.response.status, 200);
  } finally {
    await fixture.close();
  }
});

test('blocked identities cannot submit rental requests', async () => {
  const fixture = await startTestServer();
  const admin = client(fixture.baseUrl);
  const resident = client(fixture.baseUrl);
  try {
    await admin.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@ecopark.test', password: 'admin123' }
    });
    const blocked = await admin.request('/api/admin/blocked-identities', {
      method: 'POST',
      body: { identityNumber: '001203000222', reason: 'Demo blocked identity' }
    });
    assert.equal(blocked.response.status, 201);

    await resident.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'resident@ecopark.test', password: 'resident123' }
    });
    const request = await resident.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 3, bikeId: 7, requestedDurationMinutes: 60 }
    });
    assert.equal(request.response.status, 403);
    assert.match(request.payload.error, /identity|CCCD/i);
  } finally {
    await fixture.close();
  }
});

test('pending resident card rents as visitor without resident discount', async () => {
  const fixture = await startTestServer();
  const customer = client(fixture.baseUrl);
  const admin = client(fixture.baseUrl);
  try {
    const registered = await customer.request('/api/auth/register', {
      method: 'POST',
      body: registrationPayload({
        email: 'pending-resident@example.test',
        phone: '0911111131',
        identityNumber: '001203999831',
        customerType: 'resident',
        residentCardNumber: 'ECO-PENDING-001'
      })
    });
    assert.equal(registered.response.status, 201);
    assert.equal(registered.payload.user.profile.discount_eligible, 0);
    assert.equal(registered.payload.user.profile.resident_verification_status, 'pending');
    await customer.request('/api/auth/verify-email', {
      method: 'POST',
      body: { code: registered.payload.demoCode }
    });
    const request = await customer.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 2, bikeId: 3, requestedDurationMinutes: 60 }
    });
    assert.equal(request.response.status, 201);

    await admin.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@ecopark.test', password: 'admin123' }
    });
    const handover = await admin.request('/api/staff/handover', {
      method: 'POST',
      body: {
        requestId: request.payload.request.request_id,
        identityDocumentType: 'CCCD',
        identityDocumentNumber: '001203999831',
        depositAmount: 200000,
        depositDocumentHeld: '001203999831'
      }
    });
    const returned = await admin.request('/api/staff/return', {
      method: 'POST',
      body: {
        rentalId: handover.payload.rental.rental_id,
        returnStationId: 2,
        returnedAt: new Date(new Date(handover.payload.rental.started_at).getTime() + 60 * 60000).toISOString(),
        bicycleCondition: 'available'
      }
    });
    assert.equal(returned.payload.ticket.resident_discount_amount, 0);
  } finally {
    await fixture.close();
  }
});

test('bike availability excludes held pending requests', async () => {
  const fixture = await startTestServer();
  const api = client(fixture.baseUrl);
  try {
    const bikes = await api.request('/api/stations/2/bikes');
    const heldBike = bikes.payload.bikes.find((bike) => bike.bike_code === 'ECO-004');
    assert.equal(heldBike.held_for_pickup, 1);
    assert.equal(heldBike.is_available, false);
  } finally {
    await fixture.close();
  }
});

test('customer can cancel pending request and release held bike', async () => {
  const fixture = await startTestServer();
  const api = client(fixture.baseUrl);
  try {
    await api.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'resident@ecopark.test', password: 'resident123' }
    });
    const request = await api.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 3, bikeId: 7, requestedDurationMinutes: 60 }
    });
    assert.equal(request.response.status, 201);

    const heldBikes = await api.request('/api/stations/3/bikes');
    const heldBike = heldBikes.payload.bikes.find((bike) => bike.bike_code === 'ECO-007');
    assert.equal(heldBike.held_for_pickup, 1);
    assert.equal(heldBike.is_available, false);

    const cancelled = await api.request(`/api/rental-requests/${request.payload.request.request_id}/cancel`, {
      method: 'POST'
    });
    assert.equal(cancelled.response.status, 200);
    assert.equal(cancelled.payload.request.request_status, 'cancelled');

    const releasedBikes = await api.request('/api/stations/3/bikes');
    const releasedBike = releasedBikes.payload.bikes.find((bike) => bike.bike_code === 'ECO-007');
    assert.equal(releasedBike.held_for_pickup, 0);
    assert.equal(releasedBike.is_available, true);

    const history = await api.request('/api/customer/history');
    assert.ok(history.payload.archivedRequests.some((item) => item.request_id === request.payload.request.request_id));
  } finally {
    await fixture.close();
  }
});

test('handover converts request to rental and marks bike rented', async () => {
  const fixture = await startTestServer();
  const staff = client(fixture.baseUrl);
  try {
    await staff.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'staff@ecopark.test', password: 'staff123' }
    });
    const pending = await staff.request('/api/staff/pending-requests');
    const request = pending.payload.requests.find((item) => item.bike_code === 'ECO-004');
    assert.ok(request);

    const handover = await staff.request('/api/staff/handover', {
      method: 'POST',
      body: {
        requestId: request.request_id,
        identityDocumentType: 'CCCD',
        identityDocumentNumber: request.identity_number,
        depositAmount: 200000,
        depositDocumentHeld: request.identity_number
      }
    });
    assert.equal(handover.response.status, 201);
    assert.equal(handover.payload.rental.rental_status, 'in_progress');

    const fleet = await staff.request('/api/admin/bikes');
    const bike = fleet.payload.bikes.find((item) => item.bike_code === 'ECO-004');
    assert.equal(bike.bike_status, 'rented');
  } finally {
    await fixture.close();
  }
});

test('staff can exchange a pending request bike before handover', async () => {
  const fixture = await startTestServer();
  const staff = client(fixture.baseUrl);
  try {
    await staff.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'staff@ecopark.test', password: 'staff123' }
    });
    const pending = await staff.request('/api/staff/pending-requests');
    const request = pending.payload.requests.find((item) => item.bike_code === 'ECO-004');
    assert.ok(request);

    const exchanged = await staff.request(`/api/staff/rental-requests/${request.request_id}/exchange-bike`, {
      method: 'POST',
      body: { bikeId: 3 }
    });
    assert.equal(exchanged.response.status, 200);
    assert.equal(exchanged.payload.request.bike_code, 'ECO-003');

    const handover = await staff.request('/api/staff/handover', {
      method: 'POST',
      body: {
        requestId: request.request_id,
        identityDocumentType: 'CCCD',
        identityDocumentNumber: request.identity_number,
        depositAmount: 200000,
        depositDocumentHeld: request.identity_number
      }
    });
    assert.equal(handover.response.status, 201);
    assert.equal(handover.payload.rental.bike_code, 'ECO-003');
  } finally {
    await fixture.close();
  }
});

test('staff only sees and processes requests at assigned station', async () => {
  const fixture = await startTestServer();
  const resident = client(fixture.baseUrl);
  const staff = client(fixture.baseUrl);
  try {
    await resident.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'resident@ecopark.test', password: 'resident123' }
    });
    const request = await resident.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 3, bikeId: 7, requestedDurationMinutes: 60 }
    });
    assert.equal(request.response.status, 201);

    await staff.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'staff@ecopark.test', password: 'staff123' }
    });
    const pending = await staff.request('/api/staff/pending-requests');
    assert.equal(pending.response.status, 200);
    assert.ok(!pending.payload.requests.some((item) => item.request_id === request.payload.request.request_id));

    const handover = await staff.request('/api/staff/handover', {
      method: 'POST',
      body: {
        requestId: request.payload.request.request_id,
        identityDocumentType: 'CCCD',
        identityDocumentNumber: '001203000222',
        depositAmount: 200000,
        depositDocumentHeld: '001203000222'
      }
    });
    assert.equal(handover.response.status, 403);
  } finally {
    await fixture.close();
  }
});

test('station capacity update rejects values below current bike count', async () => {
  const fixture = await startTestServer();
  const admin = client(fixture.baseUrl);
  try {
    await admin.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@ecopark.test', password: 'admin123' }
    });
    const update = await admin.request('/api/admin/stations/1', {
      method: 'PATCH',
      body: {
        stationName: 'Green Bay Marina',
        address: 'Bến thuyền Green Bay, Ecopark',
        capacity: 1,
        stationStatus: 'active'
      }
    });
    assert.equal(update.response.status, 409);
  } finally {
    await fixture.close();
  }
});

test('return flow calculates resident discount, late fee, and moves bike', async () => {
  const fixture = await startTestServer();
  const customer = client(fixture.baseUrl);
  const admin = client(fixture.baseUrl);
  try {
    await customer.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'resident@ecopark.test', password: 'resident123' }
    });
    const request = await customer.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 3, bikeId: 7, requestedDurationMinutes: 120 }
    });

    await admin.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@ecopark.test', password: 'admin123' }
    });
    const handover = await admin.request('/api/staff/handover', {
      method: 'POST',
      body: {
        requestId: request.payload.request.request_id,
        identityDocumentType: 'CCCD',
        identityDocumentNumber: '001203000222',
        depositAmount: 200000,
        depositDocumentHeld: '001203000222'
      }
    });
    const rental = handover.payload.rental;
    const returnedAt = new Date(new Date(rental.started_at).getTime() + 150 * 60 * 1000).toISOString();
    const returned = await admin.request('/api/staff/return', {
      method: 'POST',
      body: {
        rentalId: rental.rental_id,
        returnStationId: 1,
        returnedAt,
        bicycleCondition: 'available'
      }
    });

    assert.equal(returned.payload.ticket.base_fee, 70000);
    assert.equal(returned.payload.ticket.resident_discount_amount, 28000);
    assert.equal(returned.payload.ticket.late_fee, 30000);
    assert.equal(returned.payload.ticket.total_amount, 72000);

    const fleet = await admin.request('/api/admin/bikes');
    const bike = fleet.payload.bikes.find((item) => item.bike_code === 'ECO-007');
    assert.equal(bike.station_id, 1);
    assert.equal(bike.bike_status, 'available');

    const audit = await admin.request('/api/admin/bike-status-logs?limit=5');
    assert.equal(audit.response.status, 200);
    assert.ok(audit.payload.logs.some((log) => (
      log.bike_code === 'ECO-007'
      && log.old_status === 'rented'
      && log.new_status === 'available'
      && log.station_name === 'Green Bay Marina'
    )));
  } finally {
    await fixture.close();
  }
});

test('demo clock drives active rental countdown and default return penalties', async () => {
  const fixture = await startTestServer();
  const customer = client(fixture.baseUrl);
  const staff = client(fixture.baseUrl);
  try {
    await customer.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'resident@ecopark.test', password: 'resident123' }
    });
    const request = await customer.request('/api/rental-requests', {
      method: 'POST',
      body: { stationId: 2, bikeId: 3, requestedDurationMinutes: 60 }
    });
    assert.equal(request.response.status, 201);

    await staff.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'staff@ecopark.test', password: 'staff123' }
    });
    const handover = await staff.request('/api/staff/handover', {
      method: 'POST',
      body: {
        requestId: request.payload.request.request_id,
        identityDocumentType: 'CCCD',
        identityDocumentNumber: '001203000222',
        depositAmount: 200000,
        depositDocumentHeld: '001203000222'
      }
    });
    assert.equal(handover.response.status, 201);

    const afterHandoverBikes = await customer.request('/api/stations/2/bikes');
    const rentedBike = afterHandoverBikes.payload.bikes.find((bike) => bike.bike_code === 'ECO-003');
    assert.equal(rentedBike.unavailable_reason, 'rented_by_you');
    assert.equal(rentedBike.is_current_customer_rental, 1);

    const advancedClock = await staff.request('/api/demo-clock', {
      method: 'POST',
      body: { advanceMinutes: 95 }
    });
    assert.equal(advancedClock.response.status, 200);
    assert.equal(advancedClock.payload.offsetMinutes, 95);

    const history = await customer.request('/api/customer/history');
    const active = history.payload.activeRentals.find((item) => item.rental_id === handover.payload.rental.rental_id);
    assert.ok(active.late_minutes >= 35);
    assert.equal(active.estimated_late_fee, 60000);

    const returned = await staff.request('/api/staff/return', {
      method: 'POST',
      body: {
        rentalId: handover.payload.rental.rental_id,
        returnStationId: 2,
        bicycleCondition: 'available',
        conditionNote: 'Demo clock return'
      }
    });
    assert.equal(returned.response.status, 201);
    assert.equal(returned.payload.ticket.base_fee, 50000);
    assert.equal(returned.payload.ticket.resident_discount_amount, 20000);
    assert.equal(returned.payload.ticket.late_fee, 60000);
    assert.equal(returned.payload.ticket.total_amount, 90000);
  } finally {
    await fixture.close();
  }
});

test('reports aggregate completed rentals', async () => {
  const fixture = await startTestServer();
  const admin = client(fixture.baseUrl);
  try {
    await admin.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@ecopark.test', password: 'admin123' }
    });
    const report = await admin.request('/api/admin/reports?period=day');
    assert.equal(report.response.status, 200);
    assert.ok(report.payload.totals.rental_count >= 1);
    assert.ok(report.payload.totals.total_revenue >= 72000);
  } finally {
    await fixture.close();
  }
});

test('supports concurrent customer and admin sessions independently', async () => {
  const fixture = await startTestServer();
  const customer = client(fixture.baseUrl);
  const resident = client(fixture.baseUrl);
  const admin = client(fixture.baseUrl);
  const adminBackup = client(fixture.baseUrl);
  try {
    const logins = await Promise.all([
      customer.request('/api/auth/login', {
        method: 'POST',
        body: { email: 'customer@ecopark.test', password: 'customer123' }
      }),
      resident.request('/api/auth/login', {
        method: 'POST',
        body: { email: 'resident@ecopark.test', password: 'resident123' }
      }),
      admin.request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@ecopark.test', password: 'admin123' }
      }),
      adminBackup.request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin2@ecopark.test', password: 'admin2123' }
      })
    ]);
    assert.deepEqual(logins.map((item) => item.response.status), [200, 200, 200, 200]);

    const sessions = await Promise.all([
      customer.request('/api/session'),
      resident.request('/api/session'),
      admin.request('/api/session'),
      adminBackup.request('/api/session')
    ]);
    assert.deepEqual(sessions.map((item) => item.payload.user.email), [
      'customer@ecopark.test',
      'resident@ecopark.test',
      'admin@ecopark.test',
      'admin2@ecopark.test'
    ]);

    const [customerHistory, residentHistory, adminReport, backupReport] = await Promise.all([
      customer.request('/api/customer/history'),
      resident.request('/api/customer/history'),
      admin.request('/api/admin/reports?period=day'),
      adminBackup.request('/api/admin/reports?period=day')
    ]);
    assert.equal(customerHistory.response.status, 200);
    assert.equal(residentHistory.response.status, 200);
    assert.equal(adminReport.response.status, 200);
    assert.equal(backupReport.response.status, 200);

    await customer.request('/api/auth/logout', { method: 'POST' });
    const [loggedOutCustomer, stillResident, stillAdmin, stillBackupAdmin] = await Promise.all([
      customer.request('/api/session'),
      resident.request('/api/session'),
      admin.request('/api/session'),
      adminBackup.request('/api/session')
    ]);
    assert.equal(loggedOutCustomer.payload.user, null);
    assert.equal(stillResident.payload.user.email, 'resident@ecopark.test');
    assert.equal(stillAdmin.payload.user.email, 'admin@ecopark.test');
    assert.equal(stillBackupAdmin.payload.user.email, 'admin2@ecopark.test');
  } finally {
    await fixture.close();
  }
});

test('existing demo database is backfilled with backup admin account', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ecopark-backfill-'));
  const dbPath = path.join(dir, 'backfill.sqlite');
  let server = null;
  try {
    server = createServer({ dbPath, seed: true });
    const backupAdmin = server.db.prepare("SELECT user_id FROM users WHERE email = 'admin2@ecopark.test'").get();
    assert.ok(backupAdmin);
    server.db.prepare('DELETE FROM staff WHERE staff_id = ?').run(backupAdmin.user_id);
    server.db.prepare('DELETE FROM users WHERE user_id = ?').run(backupAdmin.user_id);
    server.closeDatabase();
    server = null;

    server = createServer({ dbPath, seed: true });
    const restored = server.db.prepare(`
      SELECT u.email, u.role, s.staff_role
      FROM users u
      JOIN staff s ON s.staff_id = u.user_id
      WHERE u.email = 'admin2@ecopark.test'
    `).get();
    assert.equal(restored.email, 'admin2@ecopark.test');
    assert.equal(restored.role, 'admin');
    assert.equal(restored.staff_role, 'admin');
  } finally {
    if (server) server.closeDatabase();
    rmSync(dir, { recursive: true, force: true });
  }
});
