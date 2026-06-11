const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const { createAppDatabase, hashPassword, now } = require('./db');
const { BASE_PRICES, calculateTicket } = require('./pricing');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function createServer(options = {}) {
  const db = options.db || createAppDatabase({ dbPath: options.dbPath, seed: options.seed !== false });
  const sessions = new Map();

  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      if (requestUrl.pathname.startsWith('/api/')) {
        await handleApi({ db, sessions, req, res, requestUrl });
        return;
      }
      serveStatic(req, res, requestUrl);
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        error: error.publicMessage || 'Unexpected server error',
        details: process.env.NODE_ENV === 'test' ? error.message : undefined
      });
    }
  });

  server.db = db;
  server.closeDatabase = () => db.close();
  return server;
}

async function handleApi(ctx) {
  const { req, res, requestUrl } = ctx;
  const method = req.method || 'GET';
  const pathname = requestUrl.pathname;

  if (method === 'GET' && pathname === '/api/session') {
    const user = getSessionUser(ctx);
    sendJson(res, 200, { user });
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/register') {
    const body = await readJson(req);
    const result = registerCustomer(ctx, body);
    setSessionCookie(res, ctx.sessions, result.user.user_id);
    sendJson(res, 201, result);
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await readJson(req);
    const result = login(ctx, body);
    setSessionCookie(res, ctx.sessions, result.user.user_id);
    sendJson(res, 200, result);
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    clearSessionCookie(ctx, res);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === 'GET' && pathname === '/api/bike-types') {
    sendJson(res, 200, { bikeTypes: getBikeTypes(ctx.db) });
    return;
  }

  if (method === 'GET' && pathname === '/api/stations') {
    sendJson(res, 200, { stations: getStations(ctx.db, requestUrl.searchParams) });
    return;
  }

  const stationBikesMatch = pathname.match(/^\/api\/stations\/(\d+)\/bikes$/);
  if (method === 'GET' && stationBikesMatch) {
    sendJson(res, 200, { bikes: getStationBikes(ctx.db, Number(stationBikesMatch[1]), requestUrl.searchParams) });
    return;
  }

  if (method === 'POST' && pathname === '/api/rental-requests') {
    const user = requireRole(ctx, ['customer']);
    const body = await readJson(req);
    sendJson(res, 201, { request: createRentalRequest(ctx.db, user, body) });
    return;
  }

  const requestCancelMatch = pathname.match(/^\/api\/rental-requests\/(\d+)\/cancel$/);
  if (method === 'POST' && requestCancelMatch) {
    const user = requireRole(ctx, ['customer', 'staff', 'admin']);
    sendJson(res, 200, { request: cancelRentalRequest(ctx.db, user, Number(requestCancelMatch[1])) });
    return;
  }

  if (method === 'POST' && pathname === '/api/customer/resident-card') {
    const user = requireRole(ctx, ['customer']);
    const body = await readJson(req);
    sendJson(res, 200, { profile: submitResidentCard(ctx.db, user, body) });
    return;
  }

  if (method === 'GET' && pathname === '/api/customer/history') {
    const user = requireRole(ctx, ['customer']);
    sendJson(res, 200, getCustomerHistory(ctx.db, user.user_id));
    return;
  }

  if (method === 'GET' && pathname === '/api/staff/pending-requests') {
    requireRole(ctx, ['staff', 'admin']);
    sendJson(res, 200, { requests: getPendingRequests(ctx.db) });
    return;
  }

  if (method === 'GET' && pathname === '/api/staff/active-rentals') {
    requireRole(ctx, ['staff', 'admin']);
    sendJson(res, 200, { rentals: getActiveRentals(ctx.db) });
    return;
  }

  if (method === 'POST' && pathname === '/api/staff/handover') {
    const user = requireRole(ctx, ['staff', 'admin']);
    const body = await readJson(req);
    sendJson(res, 201, { rental: handoverBike(ctx.db, user, body) });
    return;
  }

  if (method === 'POST' && pathname === '/api/staff/return') {
    const user = requireRole(ctx, ['staff', 'admin']);
    const body = await readJson(req);
    sendJson(res, 201, { ticket: returnBike(ctx.db, user, body) });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/bikes') {
    requireRole(ctx, ['staff', 'admin']);
    sendJson(res, 200, { bikes: getAllBikes(ctx.db) });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/reports') {
    requireRole(ctx, ['staff', 'admin']);
    sendJson(res, 200, getReports(ctx.db, requestUrl.searchParams));
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/stations') {
    requireRole(ctx, ['admin']);
    const body = await readJson(req);
    sendJson(res, 201, { station: createStation(ctx.db, body) });
    return;
  }

  const stationUpdateMatch = pathname.match(/^\/api\/admin\/stations\/(\d+)$/);
  if (method === 'PATCH' && stationUpdateMatch) {
    requireRole(ctx, ['admin']);
    const body = await readJson(req);
    sendJson(res, 200, { station: updateStation(ctx.db, Number(stationUpdateMatch[1]), body) });
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/bikes') {
    requireRole(ctx, ['admin']);
    const body = await readJson(req);
    sendJson(res, 201, { bike: createBike(ctx.db, body) });
    return;
  }

  const bikeUpdateMatch = pathname.match(/^\/api\/admin\/bikes\/(\d+)$/);
  if (method === 'PATCH' && bikeUpdateMatch) {
    requireRole(ctx, ['admin']);
    const body = await readJson(req);
    sendJson(res, 200, { bike: updateBike(ctx.db, Number(bikeUpdateMatch[1]), body) });
    return;
  }

  const bikeStatusMatch = pathname.match(/^\/api\/admin\/bikes\/(\d+)\/status$/);
  if (method === 'PATCH' && bikeStatusMatch) {
    const user = requireRole(ctx, ['staff', 'admin']);
    const body = await readJson(req);
    sendJson(res, 200, { bike: updateBikeStatus(ctx.db, user, Number(bikeStatusMatch[1]), body) });
    return;
  }

  throw httpError(404, 'Endpoint not found');
}

function registerCustomer(ctx, body) {
  const fullName = requiredText(body.fullName, 'Full name');
  const email = requiredEmail(body.email);
  const phone = requiredText(body.phone, 'Phone');
  const password = requiredText(body.password, 'Password');
  const identityNumber = requiredText(body.identityNumber, 'Identity number');
  const address = requiredText(body.address, 'Address');
  const customerType = body.customerType === 'resident' ? 'resident' : 'visitor';
  const discountEligible = customerType === 'resident' && body.residentCardNumber ? 1 : 0;
  const createdAt = now();

  if (password.length < 6) {
    throw httpError(400, 'Password must contain at least 6 characters');
  }

  try {
    ctx.db.exec('BEGIN IMMEDIATE');
    const userId = Number(ctx.db.prepare(`
      INSERT INTO users (full_name, email, phone, password_hash, role, status, created_at)
      VALUES (?, ?, ?, ?, 'customer', 'active', ?)
    `).run(fullName, email, phone, hashPassword(password), createdAt).lastInsertRowid);

    ctx.db.prepare(`
      INSERT INTO customer_profiles
        (customer_id, identity_number, address, customer_type, identity_status, discount_eligible, created_at)
      VALUES (?, ?, ?, ?, 'verified', ?, ?)
    `).run(userId, identityNumber, address, customerType, discountEligible, createdAt);

    if (customerType === 'resident' && body.residentCardNumber) {
      const cardId = Number(ctx.db.prepare(`
        INSERT INTO resident_cards
          (customer_id, card_number, registered_address, verification_status, verified_at)
        VALUES (?, ?, ?, 'verified', ?)
      `).run(userId, String(body.residentCardNumber).trim(), address, createdAt).lastInsertRowid);
      ctx.db.prepare('UPDATE customer_profiles SET resident_card_id = ? WHERE customer_id = ?').run(cardId, userId);
    }

    ctx.db.exec('COMMIT');
    return { user: getUserById(ctx.db, userId) };
  } catch (error) {
    ctx.db.exec('ROLLBACK');
    if (String(error.message).includes('UNIQUE')) {
      throw httpError(409, 'Email already belongs to another account');
    }
    throw error;
  }
}

function login(ctx, body) {
  const email = requiredEmail(body.email);
  const password = requiredText(body.password, 'Password');
  const user = ctx.db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) AND status = 'active'").get(email);
  if (!user || user.password_hash !== hashPassword(password)) {
    throw httpError(401, 'Email or password is incorrect');
  }
  ctx.db.prepare('UPDATE users SET last_login_at = ? WHERE user_id = ?').run(now(), user.user_id);
  return { user: getUserById(ctx.db, user.user_id) };
}

function submitResidentCard(db, user, body) {
  const cardNumber = requiredText(body.cardNumber, 'Resident card number');
  const address = requiredText(body.address, 'Registered address');
  const existing = db.prepare('SELECT * FROM customer_profiles WHERE customer_id = ?').get(user.user_id);
  if (!existing) {
    throw httpError(404, 'Customer profile not found');
  }
  const cardId = Number(db.prepare(`
    INSERT INTO resident_cards
      (customer_id, card_number, registered_address, verification_status, verified_at)
    VALUES (?, ?, ?, 'verified', ?)
  `).run(user.user_id, cardNumber, address, now()).lastInsertRowid);
  db.prepare(`
    UPDATE customer_profiles
    SET customer_type = 'resident', resident_card_id = ?, discount_eligible = 1, address = ?
    WHERE customer_id = ?
  `).run(cardId, address, user.user_id);
  return getUserById(db, user.user_id).profile;
}

function createRentalRequest(db, user, body) {
  expirePendingRequests(db);
  const bikeId = Number(body.bikeId);
  const stationId = Number(body.stationId);
  const requestedDurationMinutes = Number(body.requestedDurationMinutes);
  if (!BASE_PRICES.has(requestedDurationMinutes)) {
    throw httpError(400, 'Rental duration must be 60, 120 or 180 minutes');
  }

  const profile = db.prepare('SELECT * FROM customer_profiles WHERE customer_id = ?').get(user.user_id);
  if (!profile || !profile.identity_number || !user.email) {
    throw httpError(403, 'Customer identity and email must be available before rental');
  }

  const activeRental = db.prepare(`
    SELECT rental_id FROM rentals WHERE customer_id = ? AND rental_status = 'in_progress'
  `).get(user.user_id);
  if (activeRental) {
    throw httpError(409, 'Customer already has an active rental');
  }

  const pendingCustomerRequest = db.prepare(`
    SELECT request_id FROM rental_requests
    WHERE customer_id = ? AND request_status = 'pending_pickup' AND datetime(expires_at) > datetime('now')
  `).get(user.user_id);
  if (pendingCustomerRequest) {
    throw httpError(409, 'Customer already has a pending pickup request');
  }

  const bike = db.prepare(`
    SELECT b.*, s.station_status
    FROM bikes b
    JOIN stations s ON s.station_id = b.station_id
    WHERE b.bike_id = ?
  `).get(bikeId);
  if (!bike || bike.station_id !== stationId || bike.bike_status !== 'available' || bike.station_status !== 'active') {
    throw httpError(409, 'Selected bike is not available at this station');
  }

  const pendingBikeRequest = db.prepare(`
    SELECT request_id FROM rental_requests
    WHERE bike_id = ? AND request_status = 'pending_pickup' AND datetime(expires_at) > datetime('now')
  `).get(bikeId);
  if (pendingBikeRequest) {
    throw httpError(409, 'Selected bike is already held for another request');
  }

  const createdAt = now();
  const expiresAt = new Date(Date.now() + 45 * 60 * 1000).toISOString();
  const requestId = Number(db.prepare(`
    INSERT INTO rental_requests
      (customer_id, bike_id, pickup_station_id, requested_duration_minutes, request_status, created_at, expires_at)
    VALUES (?, ?, ?, ?, 'pending_pickup', ?, ?)
  `).run(user.user_id, bikeId, stationId, requestedDurationMinutes, createdAt, expiresAt).lastInsertRowid);
  return getPendingRequest(db, requestId);
}

function cancelRentalRequest(db, user, requestId) {
  expirePendingRequests(db);
  const request = db.prepare(`
    SELECT rr.*, b.bike_code, s.station_name AS pickup_station
    FROM rental_requests rr
    JOIN bikes b ON b.bike_id = rr.bike_id
    JOIN stations s ON s.station_id = rr.pickup_station_id
    WHERE rr.request_id = ?
  `).get(requestId);
  if (!request) {
    throw httpError(404, 'Rental request not found');
  }
  if (user.role === 'customer' && request.customer_id !== user.user_id) {
    throw httpError(403, 'Customers can only cancel their own requests');
  }
  if (request.request_status !== 'pending_pickup') {
    throw httpError(409, 'Only pending pickup requests can be cancelled');
  }
  db.prepare("UPDATE rental_requests SET request_status = 'cancelled' WHERE request_id = ?").run(requestId);
  return { ...request, request_status: 'cancelled' };
}

function handoverBike(db, user, body) {
  expirePendingRequests(db);
  const requestId = Number(body.requestId);
  const depositAmount = Number(body.depositAmount);
  const documentType = requiredText(body.identityDocumentType, 'Identity document type');
  const identityDocumentNumber = requiredText(body.identityDocumentNumber, 'Identity document number');
  const documentHeld = requiredText(body.depositDocumentHeld || body.identityDocumentType, 'Deposit document');

  if (depositAmount !== 200000) {
    throw httpError(400, 'Deposit amount must be exactly 200000 VND');
  }

  const request = db.prepare(`
    SELECT rr.*, cp.identity_number, b.bike_status, b.station_id, s.station_status
    FROM rental_requests rr
    JOIN customer_profiles cp ON cp.customer_id = rr.customer_id
    JOIN bikes b ON b.bike_id = rr.bike_id
    JOIN stations s ON s.station_id = rr.pickup_station_id
    WHERE rr.request_id = ?
  `).get(requestId);
  if (!request || request.request_status !== 'pending_pickup') {
    throw httpError(404, 'Pending rental request not found');
  }
  if (new Date(request.expires_at) <= new Date()) {
    db.prepare("UPDATE rental_requests SET request_status = 'expired' WHERE request_id = ?").run(requestId);
    throw httpError(409, 'Rental request has expired');
  }
  if (request.identity_number !== identityDocumentNumber) {
    throw httpError(403, 'Identity document does not match customer profile');
  }
  if (request.bike_status !== 'available' || request.station_id !== request.pickup_station_id || request.station_status !== 'active') {
    throw httpError(409, 'Bike cannot be handed over from this station');
  }

  const startedAt = now();
  try {
    db.exec('BEGIN IMMEDIATE');
    db.prepare("UPDATE rental_requests SET request_status = 'converted' WHERE request_id = ?").run(requestId);
    const rentalId = Number(db.prepare(`
      INSERT INTO rentals
        (request_id, customer_id, bike_id, pickup_station_id, picked_up_by,
         planned_duration_minutes, started_at, rental_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress')
    `).run(
      request.request_id,
      request.customer_id,
      request.bike_id,
      request.pickup_station_id,
      user.user_id,
      request.requested_duration_minutes,
      startedAt
    ).lastInsertRowid);
    db.prepare(`
      INSERT INTO rental_deposits
        (rental_id, amount, document_type, document_reference_masked, deposit_status, collected_at)
      VALUES (?, ?, ?, ?, 'held', ?)
    `).run(rentalId, depositAmount, documentType, maskDocument(documentHeld), startedAt);
    db.prepare("UPDATE bikes SET bike_status = 'rented', last_status_updated_at = ? WHERE bike_id = ?").run(startedAt, request.bike_id);
    insertBikeLog(db, {
      bikeId: request.bike_id,
      oldStatus: 'available',
      newStatus: 'rented',
      stationId: request.pickup_station_id,
      changedBy: user.user_id,
      reason: `Rental ${rentalId} handover`
    });
    db.exec('COMMIT');
    return getRental(db, rentalId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function returnBike(db, user, body) {
  const rentalId = Number(body.rentalId);
  const returnStationId = Number(body.returnStationId);
  const returnedAt = body.returnedAt ? new Date(body.returnedAt).toISOString() : now();
  const bicycleCondition = body.bicycleCondition === 'broken' ? 'broken' : 'available';
  const conditionNote = body.conditionNote ? String(body.conditionNote).trim() : 'Returned after customer ride';

  const rental = db.prepare(`
    SELECT r.*, cp.discount_eligible, b.bike_status
    FROM rentals r
    JOIN customer_profiles cp ON cp.customer_id = r.customer_id
    JOIN bikes b ON b.bike_id = r.bike_id
    WHERE r.rental_id = ?
  `).get(rentalId);
  if (!rental || rental.rental_status !== 'in_progress') {
    throw httpError(404, 'Active rental not found');
  }

  const station = db.prepare("SELECT * FROM stations WHERE station_id = ? AND station_status = 'active'").get(returnStationId);
  if (!station) {
    throw httpError(400, 'Return station must be active');
  }

  let pricing;
  try {
    pricing = calculateTicket({
      plannedDurationMinutes: rental.planned_duration_minutes,
      startedAt: rental.started_at,
      returnedAt,
      discountEligible: Boolean(rental.discount_eligible)
    });
  } catch (error) {
    throw httpError(400, error.message);
  }

  try {
    db.exec('BEGIN IMMEDIATE');
    db.prepare(`
      UPDATE rentals
      SET return_station_id = ?, returned_by = ?, returned_at = ?, rental_status = 'completed'
      WHERE rental_id = ?
    `).run(returnStationId, user.user_id, returnedAt, rentalId);
    const ticketId = Number(db.prepare(`
      INSERT INTO rental_tickets
        (rental_id, base_fee, resident_discount_amount, late_fee, total_amount, issued_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      rentalId,
      pricing.baseFee,
      pricing.residentDiscountAmount,
      pricing.lateFee,
      pricing.totalAmount,
      returnedAt
    ).lastInsertRowid);
    db.prepare(`
      UPDATE rental_deposits
      SET deposit_status = 'returned', returned_at = ?
      WHERE rental_id = ?
    `).run(returnedAt, rentalId);
    db.prepare(`
      UPDATE bikes
      SET station_id = ?, bike_status = ?, last_status_updated_at = ?
      WHERE bike_id = ?
    `).run(returnStationId, bicycleCondition, returnedAt, rental.bike_id);
    insertBikeLog(db, {
      bikeId: rental.bike_id,
      oldStatus: 'rented',
      newStatus: bicycleCondition,
      stationId: returnStationId,
      changedBy: user.user_id,
      reason: conditionNote
    });
    db.exec('COMMIT');
    return getTicket(db, ticketId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function getStations(db, searchParams) {
  expirePendingRequests(db);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  const rows = db.prepare(`
    SELECT
      s.*,
      COUNT(b.bike_id) AS total_bikes,
      SUM(CASE WHEN b.bike_status = 'available'
        AND NOT EXISTS (
          SELECT 1 FROM rental_requests rr
          WHERE rr.bike_id = b.bike_id
            AND rr.request_status = 'pending_pickup'
            AND datetime(rr.expires_at) > datetime('now')
        )
      THEN 1 ELSE 0 END) AS available_bikes,
      SUM(CASE WHEN b.bike_status = 'rented' THEN 1 ELSE 0 END) AS rented_bikes,
      SUM(CASE WHEN b.bike_status = 'broken' THEN 1 ELSE 0 END) AS broken_bikes
    FROM stations s
    LEFT JOIN bikes b ON b.station_id = s.station_id
    GROUP BY s.station_id
    ORDER BY s.station_name
  `).all();
  return rows.map((row) => ({
    ...row,
    distance_km: Number.isFinite(lat) && Number.isFinite(lng)
      ? Number(haversineKm(lat, lng, row.latitude, row.longitude).toFixed(2))
      : null
  })).sort((a, b) => {
    if (a.distance_km == null || b.distance_km == null) return a.station_id - b.station_id;
    return a.distance_km - b.distance_km;
  });
}

function getStationBikes(db, stationId, searchParams) {
  expirePendingRequests(db);
  const typeId = Number(searchParams.get('typeId') || 0);
  const rows = db.prepare(`
    SELECT b.*, bt.type_name, bt.description,
      EXISTS (
        SELECT 1 FROM rental_requests rr
        WHERE rr.bike_id = b.bike_id
          AND rr.request_status = 'pending_pickup'
          AND datetime(rr.expires_at) > datetime('now')
      ) AS held_for_pickup
    FROM bikes b
    JOIN bike_types bt ON bt.bike_type_id = b.bike_type_id
    WHERE b.station_id = ?
      AND (? = 0 OR b.bike_type_id = ?)
    ORDER BY b.bike_code
  `).all(stationId, typeId, typeId);
  return rows.map((bike) => ({
    ...bike,
    is_available: bike.bike_status === 'available' && !bike.held_for_pickup
  }));
}

function getBikeTypes(db) {
  return db.prepare('SELECT * FROM bike_types WHERE active = 1 ORDER BY type_name').all();
}

function getCustomerHistory(db, customerId) {
  expirePendingRequests(db);
  return {
    pendingRequests: db.prepare(`
      SELECT rr.*, b.bike_code, s.station_name AS pickup_station
      FROM rental_requests rr
      JOIN bikes b ON b.bike_id = rr.bike_id
      JOIN stations s ON s.station_id = rr.pickup_station_id
      WHERE rr.customer_id = ? AND rr.request_status = 'pending_pickup'
      ORDER BY rr.created_at DESC
    `).all(customerId),
    activeRentals: db.prepare(`
      SELECT r.*, b.bike_code, ps.station_name AS pickup_station, rd.deposit_status, rd.amount AS deposit_amount
      FROM rentals r
      JOIN bikes b ON b.bike_id = r.bike_id
      JOIN stations ps ON ps.station_id = r.pickup_station_id
      JOIN rental_deposits rd ON rd.rental_id = r.rental_id
      WHERE r.customer_id = ? AND r.rental_status = 'in_progress'
      ORDER BY r.started_at DESC
    `).all(customerId),
    completedRentals: db.prepare(`
      SELECT r.*, b.bike_code, ps.station_name AS pickup_station, rs.station_name AS return_station,
        rt.ticket_id, rt.base_fee, rt.resident_discount_amount, rt.late_fee, rt.total_amount, rt.issued_at
      FROM rentals r
      JOIN bikes b ON b.bike_id = r.bike_id
      JOIN stations ps ON ps.station_id = r.pickup_station_id
      LEFT JOIN stations rs ON rs.station_id = r.return_station_id
      JOIN rental_tickets rt ON rt.rental_id = r.rental_id
      WHERE r.customer_id = ? AND r.rental_status = 'completed'
      ORDER BY r.returned_at DESC
    `).all(customerId),
    archivedRequests: db.prepare(`
      SELECT rr.*, b.bike_code, s.station_name AS pickup_station
      FROM rental_requests rr
      JOIN bikes b ON b.bike_id = rr.bike_id
      JOIN stations s ON s.station_id = rr.pickup_station_id
      WHERE rr.customer_id = ? AND rr.request_status IN ('cancelled', 'expired')
      ORDER BY rr.created_at DESC
      LIMIT 5
    `).all(customerId)
  };
}

function getPendingRequests(db) {
  expirePendingRequests(db);
  return db.prepare(`
    SELECT rr.*, u.full_name, cp.identity_number, cp.customer_type, cp.discount_eligible,
      b.bike_code, bt.type_name, s.station_name AS pickup_station
    FROM rental_requests rr
    JOIN users u ON u.user_id = rr.customer_id
    JOIN customer_profiles cp ON cp.customer_id = rr.customer_id
    JOIN bikes b ON b.bike_id = rr.bike_id
    JOIN bike_types bt ON bt.bike_type_id = b.bike_type_id
    JOIN stations s ON s.station_id = rr.pickup_station_id
    WHERE rr.request_status = 'pending_pickup'
    ORDER BY rr.created_at ASC
  `).all();
}

function getPendingRequest(db, requestId) {
  return db.prepare(`
    SELECT rr.*, b.bike_code, s.station_name AS pickup_station
    FROM rental_requests rr
    JOIN bikes b ON b.bike_id = rr.bike_id
    JOIN stations s ON s.station_id = rr.pickup_station_id
    WHERE rr.request_id = ?
  `).get(requestId);
}

function getActiveRentals(db) {
  return db.prepare(`
    SELECT r.*, u.full_name, b.bike_code, ps.station_name AS pickup_station, rd.amount AS deposit_amount
    FROM rentals r
    JOIN users u ON u.user_id = r.customer_id
    JOIN bikes b ON b.bike_id = r.bike_id
    JOIN stations ps ON ps.station_id = r.pickup_station_id
    JOIN rental_deposits rd ON rd.rental_id = r.rental_id
    WHERE r.rental_status = 'in_progress'
    ORDER BY r.started_at ASC
  `).all();
}

function getRental(db, rentalId) {
  return db.prepare(`
    SELECT r.*, u.full_name, b.bike_code, s.station_name AS pickup_station
    FROM rentals r
    JOIN users u ON u.user_id = r.customer_id
    JOIN bikes b ON b.bike_id = r.bike_id
    JOIN stations s ON s.station_id = r.pickup_station_id
    WHERE r.rental_id = ?
  `).get(rentalId);
}

function getTicket(db, ticketId) {
  return db.prepare(`
    SELECT rt.*, r.customer_id, r.bike_id, r.return_station_id, b.bike_code, s.station_name AS return_station
    FROM rental_tickets rt
    JOIN rentals r ON r.rental_id = rt.rental_id
    JOIN bikes b ON b.bike_id = r.bike_id
    JOIN stations s ON s.station_id = r.return_station_id
    WHERE rt.ticket_id = ?
  `).get(ticketId);
}

function getAllBikes(db) {
  return db.prepare(`
    SELECT b.*, bt.type_name, s.station_name,
      EXISTS (
        SELECT 1 FROM rental_requests rr
        WHERE rr.bike_id = b.bike_id
          AND rr.request_status = 'pending_pickup'
          AND datetime(rr.expires_at) > datetime('now')
      ) AS held_for_pickup
    FROM bikes b
    JOIN bike_types bt ON bt.bike_type_id = b.bike_type_id
    JOIN stations s ON s.station_id = b.station_id
    ORDER BY b.bike_code
  `).all();
}

function getReports(db, searchParams) {
  const period = ['day', 'week', 'month'].includes(searchParams.get('period')) ? searchParams.get('period') : 'day';
  const stationId = Number(searchParams.get('stationId') || 0);
  const bikeId = Number(searchParams.get('bikeId') || 0);
  const grouping = period === 'month' ? "%Y-%m" : period === 'week' ? "%Y-W%W" : "%Y-%m-%d";
  const rows = db.prepare(`
    SELECT strftime(?, r.returned_at) AS period_label,
      COUNT(r.rental_id) AS rental_count,
      SUM(rt.base_fee) AS base_revenue,
      SUM(rt.resident_discount_amount) AS resident_discounts,
      SUM(rt.late_fee) AS late_revenue,
      SUM(rt.total_amount) AS total_revenue
    FROM rentals r
    JOIN rental_tickets rt ON rt.rental_id = r.rental_id
    WHERE r.rental_status = 'completed'
      AND (? = 0 OR r.return_station_id = ? OR r.pickup_station_id = ?)
      AND (? = 0 OR r.bike_id = ?)
    GROUP BY period_label
    ORDER BY period_label DESC
  `).all(grouping, stationId, stationId, stationId, bikeId, bikeId);
  const fleet = db.prepare(`
    SELECT bike_status, COUNT(*) AS count
    FROM bikes
    GROUP BY bike_status
  `).all();
  const totals = rows.reduce((acc, row) => {
    acc.rental_count += row.rental_count || 0;
    acc.total_revenue += row.total_revenue || 0;
    acc.late_revenue += row.late_revenue || 0;
    return acc;
  }, { rental_count: 0, total_revenue: 0, late_revenue: 0 });
  return { period, rows, fleet, totals };
}

function createStation(db, body) {
  const stationName = requiredText(body.stationName, 'Station name');
  const address = requiredText(body.address, 'Address');
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const capacity = Number(body.capacity);
  const status = ['active', 'paused', 'maintenance'].includes(body.stationStatus) ? body.stationStatus : 'active';
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || capacity < 1) {
    throw httpError(400, 'Station coordinates and capacity must be valid');
  }
  const stationId = Number(db.prepare(`
    INSERT INTO stations (station_name, address, latitude, longitude, capacity, station_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(stationName, address, latitude, longitude, capacity, status).lastInsertRowid);
  return db.prepare('SELECT * FROM stations WHERE station_id = ?').get(stationId);
}

function updateStation(db, stationId, body) {
  const existing = db.prepare('SELECT * FROM stations WHERE station_id = ?').get(stationId);
  if (!existing) throw httpError(404, 'Station not found');
  const next = {
    station_name: body.stationName ? String(body.stationName).trim() : existing.station_name,
    address: body.address ? String(body.address).trim() : existing.address,
    latitude: Number.isFinite(Number(body.latitude)) ? Number(body.latitude) : existing.latitude,
    longitude: Number.isFinite(Number(body.longitude)) ? Number(body.longitude) : existing.longitude,
    capacity: Number.isFinite(Number(body.capacity)) ? Number(body.capacity) : existing.capacity,
    station_status: ['active', 'paused', 'maintenance'].includes(body.stationStatus) ? body.stationStatus : existing.station_status
  };
  const currentBikeCount = db.prepare('SELECT COUNT(*) AS count FROM bikes WHERE station_id = ?').get(stationId).count;
  if (next.capacity < currentBikeCount) {
    throw httpError(409, 'Station capacity cannot be lower than current bikes at that station');
  }
  db.prepare(`
    UPDATE stations
    SET station_name = ?, address = ?, latitude = ?, longitude = ?, capacity = ?, station_status = ?
    WHERE station_id = ?
  `).run(next.station_name, next.address, next.latitude, next.longitude, next.capacity, next.station_status, stationId);
  return db.prepare('SELECT * FROM stations WHERE station_id = ?').get(stationId);
}

function createBike(db, body) {
  const stationId = Number(body.stationId);
  const bikeTypeId = Number(body.bikeTypeId);
  const bikeCode = requiredText(body.bikeCode, 'Bike code').toUpperCase();
  const bikeStatus = ['available', 'rented', 'broken'].includes(body.bikeStatus) ? body.bikeStatus : 'available';
  const station = db.prepare('SELECT station_id FROM stations WHERE station_id = ?').get(stationId);
  const type = db.prepare('SELECT bike_type_id FROM bike_types WHERE bike_type_id = ?').get(bikeTypeId);
  if (!station || !type) {
    throw httpError(400, 'Station and bike type must exist');
  }
  try {
    const bikeId = Number(db.prepare(`
      INSERT INTO bikes (station_id, bike_type_id, bike_code, bike_status, last_status_updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(stationId, bikeTypeId, bikeCode, bikeStatus, now()).lastInsertRowid);
    return getAllBikes(db).find((bike) => bike.bike_id === bikeId);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      throw httpError(409, 'Bike code already exists');
    }
    throw error;
  }
}

function updateBike(db, bikeId, body) {
  const existing = db.prepare('SELECT * FROM bikes WHERE bike_id = ?').get(bikeId);
  if (!existing) throw httpError(404, 'Bike not found');
  if (existing.bike_status === 'rented' && body.stationId && Number(body.stationId) !== existing.station_id) {
    throw httpError(409, 'Rented bikes cannot be moved manually');
  }
  const stationId = Number(body.stationId || existing.station_id);
  const bikeTypeId = Number(body.bikeTypeId || existing.bike_type_id);
  const bikeCode = body.bikeCode ? String(body.bikeCode).trim().toUpperCase() : existing.bike_code;
  db.prepare(`
    UPDATE bikes
    SET station_id = ?, bike_type_id = ?, bike_code = ?, last_status_updated_at = ?
    WHERE bike_id = ?
  `).run(stationId, bikeTypeId, bikeCode, now(), bikeId);
  return getAllBikes(db).find((bike) => bike.bike_id === bikeId);
}

function updateBikeStatus(db, user, bikeId, body) {
  const existing = db.prepare('SELECT * FROM bikes WHERE bike_id = ?').get(bikeId);
  if (!existing) throw httpError(404, 'Bike not found');
  const nextStatus = body.bikeStatus;
  if (!['available', 'rented', 'broken'].includes(nextStatus)) {
    throw httpError(400, 'Bike status must be available, rented or broken');
  }
  if (existing.bike_status === 'rented' && nextStatus !== 'rented') {
    const activeRental = db.prepare(`
      SELECT rental_id FROM rentals WHERE bike_id = ? AND rental_status = 'in_progress'
    `).get(bikeId);
    if (activeRental) {
      throw httpError(409, 'Finish active rental before changing rented bike status');
    }
  }
  const reason = requiredText(body.reason || 'Manual status update', 'Status change reason');
  db.prepare('UPDATE bikes SET bike_status = ?, last_status_updated_at = ? WHERE bike_id = ?')
    .run(nextStatus, now(), bikeId);
  insertBikeLog(db, {
    bikeId,
    oldStatus: existing.bike_status,
    newStatus: nextStatus,
    stationId: existing.station_id,
    changedBy: user.user_id,
    reason
  });
  return getAllBikes(db).find((bike) => bike.bike_id === bikeId);
}

function expirePendingRequests(db) {
  db.prepare(`
    UPDATE rental_requests
    SET request_status = 'expired'
    WHERE request_status = 'pending_pickup'
      AND datetime(expires_at) <= datetime('now')
  `).run();
}

function insertBikeLog(db, { bikeId, oldStatus, newStatus, stationId, changedBy, reason }) {
  db.prepare(`
    INSERT INTO bike_status_logs
      (bike_id, old_status, new_status, station_id, changed_by, reason, changed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(bikeId, oldStatus, newStatus, stationId, changedBy, reason, now());
}

function getSessionUser(ctx) {
  const cookies = parseCookies(ctx.req);
  const token = cookies.ecopark_session;
  const userId = token ? ctx.sessions.get(token) : null;
  return userId ? getUserById(ctx.db, userId) : null;
}

function requireRole(ctx, roles) {
  const user = getSessionUser(ctx);
  if (!user) {
    throw httpError(401, 'Authentication required');
  }
  if (!roles.includes(user.role)) {
    throw httpError(403, 'This account cannot perform that action');
  }
  return user;
}

function getUserById(db, userId) {
  const user = db.prepare(`
    SELECT user_id, full_name, email, phone, role, status, created_at, last_login_at
    FROM users
    WHERE user_id = ?
  `).get(userId);
  if (!user) return null;
  if (user.role === 'customer') {
    user.profile = db.prepare(`
      SELECT cp.*, rc.card_number, rc.verification_status AS resident_verification_status
      FROM customer_profiles cp
      LEFT JOIN resident_cards rc ON rc.resident_card_id = cp.resident_card_id
      WHERE cp.customer_id = ?
    `).get(userId);
  } else {
    user.staff = db.prepare('SELECT * FROM staff WHERE staff_id = ?').get(userId);
  }
  return user;
}

function setSessionCookie(res, sessions, userId) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, userId);
  res.setHeader('Set-Cookie', `ecopark_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
}

function clearSessionCookie(ctx, res) {
  const token = parseCookies(ctx.req).ecopark_session;
  if (token) ctx.sessions.delete(token);
  res.setHeader('Set-Cookie', 'ecopark_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').filter(Boolean).map((part) => {
    const [name, ...value] = part.trim().split('=');
    return [name, decodeURIComponent(value.join('='))];
  }));
}

function serveStatic(req, res, requestUrl) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendPlain(res, 405, 'Method not allowed');
    return;
  }

  const vendorPath = resolveVendorPath(requestUrl.pathname);
  const filePath = vendorPath || resolvePublicPath(requestUrl.pathname);
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    sendFile(res, indexPath);
    return;
  }
  sendFile(res, filePath);
}

function resolvePublicPath(urlPath) {
  const requested = urlPath === '/' ? '/index.html' : decodeURIComponent(urlPath);
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));
  return filePath.startsWith(PUBLIC_DIR) ? filePath : null;
}

function resolveVendorPath(urlPath) {
  const gsapMatch = urlPath.match(/^\/vendor\/gsap\/(gsap\.min\.js)$/);
  if (gsapMatch) {
    return path.join(ROOT_DIR, 'node_modules', 'gsap', 'dist', gsapMatch[1]);
  }
  const threeMatch = urlPath.match(/^\/vendor\/(three\.[a-z0-9.-]+\.js)$/);
  if (threeMatch) {
    return path.join(ROOT_DIR, 'node_modules', 'three', 'build', threeMatch[1]);
  }
  const leafletMatch = urlPath.match(/^\/vendor\/leaflet\/(leaflet\.(?:css|js))$/);
  if (leafletMatch) {
    return path.join(ROOT_DIR, 'node_modules', 'leaflet', 'dist', leafletMatch[1]);
  }
  const iconMatch = urlPath.match(/^\/vendor\/icons\/([a-z0-9-]+\.svg)$/);
  if (iconMatch) {
    return path.join(ROOT_DIR, 'node_modules', 'lucide-static', 'icons', iconMatch[1]);
  }
  return null;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendPlain(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(httpError(413, 'Request body is too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(httpError(400, 'Request body must be valid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function requiredText(value, label) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    throw httpError(400, `${label} is required`);
  }
  return normalized;
}

function requiredEmail(value) {
  const email = requiredText(value, 'Email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, 'Email format is invalid');
  }
  return email;
}

function maskDocument(value) {
  const normalized = String(value || '').replace(/\s+/g, '');
  return `***${normalized.slice(-6)}`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(a));
}

function toRad(value) {
  return value * Math.PI / 180;
}

function httpError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

module.exports = {
  createServer,
  getStations,
  getStationBikes
};
