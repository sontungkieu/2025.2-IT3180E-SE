const { DEFAULT_DB_PATH, resetDatabase } = require('./db');

resetDatabase(DEFAULT_DB_PATH);
console.log(`Reset local database at ${DEFAULT_DB_PATH}`);
