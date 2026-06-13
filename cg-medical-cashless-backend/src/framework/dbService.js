const { adminPool, dbkeyMap } = require('../config/db');

/**
 * Run a parameterized query against a given pool and return the rows.
 */
async function executeQuery(pool, sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    return rows;
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Build a SQL string + ordered param-name list from a stored query definition.
 *
 * The definition (mas_custom_queries.query_object) looks like:
 * {
 *   "base": "SELECT id, name FROM hospital $join $select $where $group",
 *   "params": [],                                  // always-bound param names
 *   "permission": { "A": { "where": "is_active = 1" } },
 *   "other": { "city": { "where": "city = ?", "params": ["city"] } }
 * }
 *
 * Placeholders in `base`: $join, $select, $where, $group.
 * Each clause block may contain: join[], select, group, where, params[].
 */
function buildQuery(data, permission, paramKeys) {
  let query = data.base;

  const join_arr = new Set();
  const select_arr = [];
  const group_by_arr = [];
  const where_arr = [];
  const params_arr = [...(data.params || [])];

  const mergeClauses = (obj) => {
    if (!obj) return;
    obj.join && obj.join.forEach((j) => join_arr.add(j));
    obj.select && select_arr.push(obj.select);
    obj.group && group_by_arr.push(obj.group);
    obj.where && where_arr.push(obj.where);
    obj.params && params_arr.push(...obj.params);
  };

  // permission-level clause (A = full, S = self, etc.)
  mergeClauses(data.permission && data.permission[permission]);

  // optional clauses toggled by which request params were supplied
  if (paramKeys && paramKeys.length) {
    paramKeys.forEach((key) => mergeClauses(data.other && data.other[key]));
  }

  // Support an optional leading WITH clause: only substitute in the main SELECT.
  let withClause = '';
  let mainQuery = query;
  if (/^\s*WITH/i.test(query)) {
    const splitIndex = query.lastIndexOf('SELECT');
    withClause = query.slice(0, splitIndex);
    mainQuery = query.slice(splitIndex);
  }

  // Detect existing WHERE/GROUP BY on the query with the placeholder tokens removed,
  // otherwise the literal "$where" token (which contains "where") corrupts the decision.
  const baseNoTokens = mainQuery.replace(/\$(join|select|where|group)/gi, '');
  const hasWhere = /\bwhere\b/i.test(baseNoTokens);
  const hasGroupBy = /\bgroup\s+by\b/i.test(baseNoTokens);

  mainQuery = mainQuery
    .replace('$join', join_arr.size ? [...join_arr].join(' ') : '')
    .replace('$select', select_arr.length ? ', ' + select_arr.join(', ') : '')
    .replace(
      '$where',
      where_arr.length ? (hasWhere ? ' AND ' : ' WHERE ') + where_arr.join(' AND ') : ''
    )
    .replace(
      '$group',
      group_by_arr.length ? (hasGroupBy ? ', ' : ' GROUP BY ') + group_by_arr.join(', ') : ''
    );

  return { query: (withClause + mainQuery).trim(), params: params_arr };
}

/**
 * Resolve the stored query for sessionDetails.query_id, build it with the request params,
 * and return { pool, query, params } ready to execute.
 */
async function getQueryFromID(params, sessionDetails) {
  if (!(sessionDetails.query_id && typeof sessionDetails.query_id === 'number')) {
    throw { message: 'query_id is required and must be a number.' };
  }

  const access_type = sessionDetails.access_type || 'A';

  const rows = await executeQuery(
    adminPool,
    'SELECT * FROM mas_custom_queries WHERE query_id = ?',
    [sessionDetails.query_id]
  );

  if (!rows || rows.length !== 1) {
    throw { message: `no/multiple record in mas_custom_queries for query_id ${sessionDetails.query_id}` };
  }

  const definition = JSON.parse(rows[0].query_object);

  // access_type 'A' is always allowed; otherwise the definition must permit it.
  if (!(access_type === 'A' || (definition.permission && definition.permission[access_type]))) {
    throw { message: `access_type ${access_type} not permitted for query ${definition.query_name}` };
  }

  // Strip empty/sentinel values so they don't become active filters.
  Object.keys(params).forEach((key) => {
    const v = params[key];
    if (v === null || v === '' || v === 'null' || v === undefined || v === -1) {
      delete params[key];
    }
  });

  // Pick the target business DB for this query.
  const pool = dbkeyMap[rows[0].base_database];
  if (!pool) {
    throw { message: `no pool configured for base_database ${rows[0].base_database}` };
  }

  // Keys present in the request decide which `other` clauses get merged in.
  const paramKeys = Object.keys(params);

  const built = buildQuery(definition, access_type, paramKeys);

  // Map each required param name to its actual value (request first, then session for 'S').
  const finalParams = [];
  for (const key of built.params) {
    if (key in params) {
      finalParams.push(params[key]);
    } else if (access_type === 'S' && key in sessionDetails) {
      finalParams.push(sessionDetails[key]);
    } else {
      throw {
        message: `param "${key}" missing for query_id ${sessionDetails.query_id}: ${built.query}`
      };
    }
  }

  return { pool, query: built.query, params: finalParams };
}

/**
 * Top-level auto-API entry: resolve the query from metadata and execute it.
 */
async function getQueryDataFromId(req, params, sessionDetails) {
  const { pool, query, params: bind } = await getQueryFromID(params, sessionDetails);
  return executeQuery(pool, query, bind);
}

module.exports = {
  executeQuery,
  buildQuery,
  getQueryFromID,
  getQueryDataFromId
};
