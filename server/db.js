const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_DB_PATH = path.join(ROOT_DIR, 'data', 'ecopark.sqlite');
const PASSWORD_PREFIX = 'pbkdf2_sha256';
const PASSWORD_ITERATIONS = 120000;

function now() {
  return new Date().toISOString();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const digest = crypto.pbkdf2Sync(String(password), salt, PASSWORD_ITERATIONS, 32, 'sha256').toString('hex');
  return `${PASSWORD_PREFIX}$${PASSWORD_ITERATIONS}$${salt}$${digest}`;
}

function legacyHashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function verifyPassword(password, storedHash) {
  const stored = String(storedHash || '');
  if (stored.startsWith(`${PASSWORD_PREFIX}$`)) {
    const [, iterationsText, salt, expected] = stored.split('$');
    const iterations = Number(iterationsText);
    if (!Number.isInteger(iterations) || !salt || !expected) return false;
    const actual = crypto.pbkdf2Sync(String(password), salt, iterations, 32, 'sha256').toString('hex');
    return timingSafeHexEqual(actual, expected);
  }
  return timingSafeHexEqual(legacyHashPassword(password), stored);
}

function passwordNeedsRehash(storedHash) {
  return !String(storedHash || '').startsWith(`${PASSWORD_PREFIX}$${PASSWORD_ITERATIONS}$`);
}

function timingSafeHexEqual(actual, expected) {
  const actualBuffer = Buffer.from(String(actual || ''), 'hex');
  const expectedBuffer = Buffer.from(String(expected || ''), 'hex');
  if (!actualBuffer.length || actualBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function openDatabase(dbPath = process.env.ECOPARK_DB_PATH || DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA journal_mode = WAL');
  migrate(db);
  return db;
}

function createAppDatabase({ dbPath = process.env.ECOPARK_DB_PATH || DEFAULT_DB_PATH, seed = true } = {}) {
  const db = openDatabase(dbPath);
  if (seed) {
    seedDatabase(db);
  }
  return db;
}

function resetDatabase(dbPath = process.env.ECOPARK_DB_PATH || DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true });
  }
  if (dbPath !== ':memory:' && fs.existsSync(`${dbPath}-wal`)) {
    fs.rmSync(`${dbPath}-wal`, { force: true });
  }
  if (dbPath !== ':memory:' && fs.existsSync(`${dbPath}-shm`)) {
    fs.rmSync(`${dbPath}-shm`, { force: true });
  }
  const db = createAppDatabase({ dbPath, seed: true });
  db.close();
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'admin')),
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS customer_profiles (
      customer_id INTEGER PRIMARY KEY,
      identity_number TEXT NOT NULL,
      address TEXT NOT NULL,
      customer_type TEXT NOT NULL CHECK (customer_type IN ('visitor', 'resident')),
      resident_card_id INTEGER,
      identity_status TEXT NOT NULL DEFAULT 'verified',
      discount_eligible INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS resident_cards (
      resident_card_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      card_number TEXT NOT NULL,
      registered_address TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      verified_by INTEGER,
      verified_at TEXT,
      FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id),
      FOREIGN KEY (verified_by) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS staff (
      staff_id INTEGER PRIMARY KEY,
      staff_code TEXT NOT NULL UNIQUE,
      staff_role TEXT NOT NULL CHECK (staff_role IN ('staff', 'manager', 'operator', 'admin')),
      station_id INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (staff_id) REFERENCES users(user_id),
      FOREIGN KEY (station_id) REFERENCES stations(station_id)
    );

    CREATE TABLE IF NOT EXISTS stations (
      station_id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      capacity INTEGER NOT NULL,
      station_status TEXT NOT NULL CHECK (station_status IN ('active', 'paused', 'maintenance'))
    );

    CREATE TABLE IF NOT EXISTS bike_types (
      bike_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bikes (
      bike_id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      bike_type_id INTEGER NOT NULL,
      bike_code TEXT NOT NULL UNIQUE,
      bike_status TEXT NOT NULL CHECK (bike_status IN ('available', 'rented', 'broken')),
      last_status_updated_at TEXT NOT NULL,
      FOREIGN KEY (station_id) REFERENCES stations(station_id),
      FOREIGN KEY (bike_type_id) REFERENCES bike_types(bike_type_id)
    );

    CREATE TABLE IF NOT EXISTS pricing_policies (
      policy_id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration_minutes INTEGER NOT NULL,
      base_price INTEGER NOT NULL,
      late_fee_per_30min INTEGER NOT NULL,
      resident_discount_rate REAL NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      effective_from TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rental_requests (
      request_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      bike_id INTEGER NOT NULL,
      pickup_station_id INTEGER NOT NULL,
      requested_duration_minutes INTEGER NOT NULL,
      request_status TEXT NOT NULL CHECK (request_status IN ('pending_pickup', 'cancelled', 'expired', 'converted')),
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id),
      FOREIGN KEY (bike_id) REFERENCES bikes(bike_id),
      FOREIGN KEY (pickup_station_id) REFERENCES stations(station_id)
    );

    CREATE TABLE IF NOT EXISTS rentals (
      rental_id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      bike_id INTEGER NOT NULL,
      pickup_station_id INTEGER NOT NULL,
      return_station_id INTEGER,
      picked_up_by INTEGER NOT NULL,
      returned_by INTEGER,
      planned_duration_minutes INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      returned_at TEXT,
      rental_status TEXT NOT NULL CHECK (rental_status IN ('in_progress', 'completed', 'review')),
      FOREIGN KEY (request_id) REFERENCES rental_requests(request_id),
      FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id),
      FOREIGN KEY (bike_id) REFERENCES bikes(bike_id),
      FOREIGN KEY (pickup_station_id) REFERENCES stations(station_id),
      FOREIGN KEY (return_station_id) REFERENCES stations(station_id),
      FOREIGN KEY (picked_up_by) REFERENCES staff(staff_id),
      FOREIGN KEY (returned_by) REFERENCES staff(staff_id)
    );

    CREATE TABLE IF NOT EXISTS rental_deposits (
      deposit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      rental_id INTEGER NOT NULL UNIQUE,
      amount INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      document_reference_masked TEXT NOT NULL,
      deposit_status TEXT NOT NULL CHECK (deposit_status IN ('held', 'returned', 'review')),
      collected_at TEXT NOT NULL,
      returned_at TEXT,
      FOREIGN KEY (rental_id) REFERENCES rentals(rental_id)
    );

    CREATE TABLE IF NOT EXISTS rental_tickets (
      ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
      rental_id INTEGER NOT NULL UNIQUE,
      base_fee INTEGER NOT NULL,
      resident_discount_amount INTEGER NOT NULL,
      late_fee INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      issued_at TEXT NOT NULL,
      FOREIGN KEY (rental_id) REFERENCES rentals(rental_id)
    );

    CREATE TABLE IF NOT EXISTS bike_status_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      bike_id INTEGER NOT NULL,
      old_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      station_id INTEGER NOT NULL,
      changed_by INTEGER NOT NULL,
      reason TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      FOREIGN KEY (bike_id) REFERENCES bikes(bike_id),
      FOREIGN KEY (station_id) REFERENCES stations(station_id),
      FOREIGN KEY (changed_by) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocked_identities (
      identity_number TEXT PRIMARY KEY,
      reason TEXT NOT NULL,
      blocked_by INTEGER,
      blocked_at TEXT NOT NULL,
      FOREIGN KEY (blocked_by) REFERENCES users(user_id)
    );
  `);

  addColumnIfMissing(db, 'users', 'email_verified_at', 'TEXT');
  addColumnIfMissing(db, 'users', 'email_verification_code_hash', 'TEXT');
  addColumnIfMissing(db, 'users', 'email_verification_expires_at', 'TEXT');
  addColumnIfMissing(db, 'users', 'password_reset_code_hash', 'TEXT');
  addColumnIfMissing(db, 'users', 'password_reset_expires_at', 'TEXT');
  addColumnIfMissing(db, 'customer_profiles', 'identity_review_note', 'TEXT');
  addColumnIfMissing(db, 'customer_profiles', 'identity_reviewed_at', 'TEXT');
  addColumnIfMissing(db, 'resident_cards', 'review_note', 'TEXT');

  db.prepare(`
    UPDATE users
    SET email_verified_at = COALESCE(email_verified_at, created_at)
    WHERE email_verified_at IS NULL
  `).run();
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  const existing = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (existing.some((column) => column.name === columnName)) return;
  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function seedDatabase(db) {
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (count > 0) {
    ensureDemoAccounts(db);
    return;
  }

  const createdAt = now();
  const stationInsert = db.prepare(`
    INSERT INTO stations (station_name, address, latitude, longitude, capacity, station_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stationInsert.run('Green Bay Marina', 'Bến thuyền Green Bay, Ecopark', 20.953823, 105.932914, 28, 'active');
  stationInsert.run('Spring Park Gate', 'Cổng công viên Mùa Xuân, Ecopark', 20.950889, 105.936712, 24, 'active');
  stationInsert.run('Swan Lake Plaza', 'Quảng trường Hồ Thiên Nga, Ecopark', 20.946341, 105.934224, 32, 'active');

  const typeInsert = db.prepare('INSERT INTO bike_types (type_name, description, active) VALUES (?, ?, 1)');
  typeInsert.run('City bike', 'Xe đạp đô thị nhẹ, phù hợp tham quan công viên và hồ nước.');
  typeInsert.run('Family tandem', 'Xe đôi dành cho nhóm nhỏ hoặc gia đình.');
  typeInsert.run('Child-seat bike', 'Xe có ghế trẻ em, phù hợp gia đình có trẻ nhỏ.');

  const userInsert = db.prepare(`
    INSERT INTO users (full_name, email, phone, password_hash, role, status, created_at, email_verified_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `);
  const admin = userInsert.run('Admin Ecopark', 'admin@ecopark.test', '0900000001', hashPassword('admin123'), 'admin', createdAt, createdAt).lastInsertRowid;
  const adminBackup = userInsert.run('Operations Admin', 'admin2@ecopark.test', '0900000005', hashPassword('admin2123'), 'admin', createdAt, createdAt).lastInsertRowid;
  const staffUser = userInsert.run('Spring Park Staff', 'staff@ecopark.test', '0900000002', hashPassword('staff123'), 'staff', createdAt, createdAt).lastInsertRowid;
  const customer = userInsert.run('Nguyen Ha Linh', 'customer@ecopark.test', '0900000003', hashPassword('customer123'), 'customer', createdAt, createdAt).lastInsertRowid;
  const resident = userInsert.run('Tran Minh An', 'resident@ecopark.test', '0900000004', hashPassword('resident123'), 'customer', createdAt, createdAt).lastInsertRowid;

  db.prepare('INSERT INTO staff (staff_id, staff_code, staff_role, station_id, active) VALUES (?, ?, ?, ?, 1)')
    .run(admin, 'ADM-001', 'admin', null);
  db.prepare('INSERT INTO staff (staff_id, staff_code, staff_role, station_id, active) VALUES (?, ?, ?, ?, 1)')
    .run(adminBackup, 'ADM-002', 'admin', null);
  db.prepare('INSERT INTO staff (staff_id, staff_code, staff_role, station_id, active) VALUES (?, ?, ?, ?, 1)')
    .run(staffUser, 'STF-SPR-01', 'manager', 2);

  const profileInsert = db.prepare(`
    INSERT INTO customer_profiles
      (customer_id, identity_number, address, customer_type, identity_status, discount_eligible, created_at)
    VALUES (?, ?, ?, ?, 'verified', ?, ?)
  `);
  profileInsert.run(customer, '001203000111', 'Park River, Ecopark', 'visitor', 0, createdAt);
  profileInsert.run(resident, '001203000222', 'Aqua Bay, Ecopark', 'resident', 1, createdAt);

  const cardId = db.prepare(`
    INSERT INTO resident_cards
      (customer_id, card_number, registered_address, verification_status, verified_by, verified_at)
    VALUES (?, ?, ?, 'verified', ?, ?)
  `).run(resident, 'ECO-RES-2026-001', 'Aqua Bay, Ecopark', admin, createdAt).lastInsertRowid;
  db.prepare('UPDATE customer_profiles SET resident_card_id = ? WHERE customer_id = ?').run(cardId, resident);

  const bikeInsert = db.prepare(`
    INSERT INTO bikes (station_id, bike_type_id, bike_code, bike_status, last_status_updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  bikeInsert.run(1, 1, 'ECO-001', 'available', createdAt);
  bikeInsert.run(1, 2, 'ECO-002', 'available', createdAt);
  bikeInsert.run(2, 1, 'ECO-003', 'available', createdAt);
  bikeInsert.run(2, 3, 'ECO-004', 'available', createdAt);
  bikeInsert.run(3, 1, 'ECO-005', 'broken', createdAt);
  bikeInsert.run(3, 2, 'ECO-006', 'available', createdAt);
  bikeInsert.run(3, 3, 'ECO-007', 'available', createdAt);

  const policyInsert = db.prepare(`
    INSERT INTO pricing_policies
      (duration_minutes, base_price, late_fee_per_30min, resident_discount_rate, active, effective_from)
    VALUES (?, ?, 30000, 0.4, 1, ?)
  `);
  policyInsert.run(60, 50000, createdAt);
  policyInsert.run(120, 70000, createdAt);
  policyInsert.run(180, 100000, createdAt);

  const requestCreated = new Date(Date.now() - 18 * 60 * 1000).toISOString();
  const requestExpires = new Date(Date.now() + 42 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO rental_requests
      (customer_id, bike_id, pickup_station_id, requested_duration_minutes, request_status, created_at, expires_at)
    VALUES (?, 4, 2, 120, 'pending_pickup', ?, ?)
  `).run(customer, requestCreated, requestExpires);

  const completedRequest = db.prepare(`
    INSERT INTO rental_requests
      (customer_id, bike_id, pickup_station_id, requested_duration_minutes, request_status, created_at, expires_at)
    VALUES (?, 1, 1, 120, 'converted', ?, ?)
  `).run(resident, new Date(Date.now() - 3 * 86400000).toISOString(), new Date(Date.now() - 3 * 86400000 + 3600000).toISOString()).lastInsertRowid;
  const rentalId = db.prepare(`
    INSERT INTO rentals
      (request_id, customer_id, bike_id, pickup_station_id, return_station_id, picked_up_by, returned_by,
       planned_duration_minutes, started_at, returned_at, rental_status)
    VALUES (?, ?, 1, 1, 3, ?, ?, 120, ?, ?, 'completed')
  `).run(
    completedRequest,
    resident,
    staffUser,
    staffUser,
    new Date(Date.now() - 3 * 86400000).toISOString(),
    new Date(Date.now() - 3 * 86400000 + 130 * 60000).toISOString()
  ).lastInsertRowid;
  db.prepare(`
    INSERT INTO rental_deposits
      (rental_id, amount, document_type, document_reference_masked, deposit_status, collected_at, returned_at)
    VALUES (?, 200000, 'CCCD', '***000222', 'returned', ?, ?)
  `).run(rentalId, new Date(Date.now() - 3 * 86400000).toISOString(), new Date(Date.now() - 3 * 86400000 + 130 * 60000).toISOString());
  db.prepare(`
    INSERT INTO rental_tickets
      (rental_id, base_fee, resident_discount_amount, late_fee, total_amount, issued_at)
    VALUES (?, 70000, 28000, 30000, 72000, ?)
  `).run(rentalId, new Date(Date.now() - 3 * 86400000 + 130 * 60000).toISOString());
}

function ensureDemoAccounts(db) {
  const createdAt = now();
  const backupEmail = 'admin2@ecopark.test';
  const existing = db.prepare('SELECT user_id FROM users WHERE lower(email) = lower(?)').get(backupEmail);
  const adminBackupId = existing?.user_id || db.prepare(`
    INSERT INTO users (full_name, email, phone, password_hash, role, status, created_at, email_verified_at)
    VALUES (?, ?, ?, ?, 'admin', 'active', ?, ?)
  `).run('Operations Admin', backupEmail, '0900000005', hashPassword('admin2123'), createdAt, createdAt).lastInsertRowid;

  db.prepare(`
    UPDATE users
    SET email_verified_at = COALESCE(email_verified_at, created_at)
    WHERE lower(email) IN (
      'admin@ecopark.test',
      'admin2@ecopark.test',
      'staff@ecopark.test',
      'customer@ecopark.test',
      'resident@ecopark.test'
    )
  `).run();

  db.prepare(`
    INSERT OR IGNORE INTO staff (staff_id, staff_code, staff_role, station_id, active)
    VALUES (?, 'ADM-002', 'admin', NULL, 1)
  `).run(adminBackupId);
}

module.exports = {
  DEFAULT_DB_PATH,
  createAppDatabase,
  hashPassword,
  legacyHashPassword,
  now,
  openDatabase,
  passwordNeedsRehash,
  resetDatabase,
  verifyPassword
};
