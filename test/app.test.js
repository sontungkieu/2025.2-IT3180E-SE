const assert = require('node:assert/strict');
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

test('registration validates duplicate email', async () => {
  const fixture = await startTestServer();
  const api = client(fixture.baseUrl);
  try {
    const first = await api.request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Pham Thanh Mai',
        email: 'mai@example.test',
        phone: '0911111111',
        password: 'secret1',
        identityNumber: '001203999888',
        address: 'Ecopark'
      }
    });
    assert.equal(first.response.status, 201);

    const second = await api.request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Pham Thanh Mai',
        email: 'mai@example.test',
        phone: '0911111112',
        password: 'secret1',
        identityNumber: '001203999889',
        address: 'Ecopark'
      }
    });
    assert.equal(second.response.status, 409);
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

test('return flow calculates resident discount, late fee, and moves bike', async () => {
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
      body: { stationId: 3, bikeId: 7, requestedDurationMinutes: 120 }
    });

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
    const rental = handover.payload.rental;
    const returnedAt = new Date(new Date(rental.started_at).getTime() + 150 * 60 * 1000).toISOString();
    const returned = await staff.request('/api/staff/return', {
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

    const fleet = await staff.request('/api/admin/bikes');
    const bike = fleet.payload.bikes.find((item) => item.bike_code === 'ECO-007');
    assert.equal(bike.station_id, 1);
    assert.equal(bike.bike_status, 'available');
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
