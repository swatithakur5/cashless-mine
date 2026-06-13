const mariadb = require('mariadb');

// Business database pool (holds the actual application data).
const businessPool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  // Return BIGINT columns as JS numbers so JSON.stringify of result rows never throws.
  bigIntAsNumber: true,
  insertIdAsNumber: true
});

// Admin/metadata database pool (holds mas_api, map_api_query, mas_custom_queries ...).
// If no separate admin DB is configured, the metadata tables are assumed to live in the
// business database and we reuse the same pool.
const adminPool = process.env.ADMIN_DB_HOST
  ? mariadb.createPool({
      host: process.env.ADMIN_DB_HOST,
      port: process.env.ADMIN_DB_PORT,
      user: process.env.ADMIN_DB_USER,
      password: process.env.ADMIN_DB_PASSWORD,
      database: process.env.ADMIN_DB_NAME,
      connectionLimit: 10,
      bigIntAsNumber: true,
      insertIdAsNumber: true
    })
  : businessPool;

// Maps the logical `base_database` value stored in mas_custom_queries to a real pool.
// Add more business databases here as the system grows.
const dbkeyMap = {
  cg_main: businessPool
};

// Keep the default export as the business pool so existing modules that do
// `const db = require('../config/db')` and call `db.getConnection()` keep working.
module.exports = businessPool;
module.exports.businessPool = businessPool;
module.exports.adminPool = adminPool;
module.exports.dbkeyMap = dbkeyMap;
