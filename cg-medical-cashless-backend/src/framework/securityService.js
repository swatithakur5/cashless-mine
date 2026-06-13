const { adminPool } = require('../config/db');
const dbService = require('./dbService');

// Hand-written service files can be registered here later (service_name -> { funcName: fn }).
// Auto APIs (api_creation = 'A') need no entry — they are resolved purely from metadata.
const service_files = {};

/**
 * Look up the API metadata for the current request path from mas_api / map_api_query,
 * verify the HTTP method, and (optionally) enforce designation-based access control.
 * Returns the merged api details (api_creation, query_id, is_control_access, ...).
 */
async function isApiPermissioned(req) {
  // Use originalUrl so the router mount path (e.g. "/api") is preserved.
  // req._parsedUrl.pathname is mount-relative and drops the "/api" prefix.
  const path = req.originalUrl.split('?')[0].replace(/\/$/, '');
  const parts = path.split('/');
  const prefix = parts[1]; // e.g. "api"
  const rest = '/' + parts.slice(2).join('/'); // e.g. "/list/get/getHospitalList"

  console.log('[API lookup] path=%s prefix=%s rest=%s', path, prefix, rest);
  const rows = await dbService.executeQuery(
    adminPool,
    `SELECT ma.api_id, ma.api_creation, ma.api_name, maq.query_id,
            ma.api_path, ma.api_type, ma.is_control_access
       FROM mas_api ma
       LEFT JOIN map_api_query maq ON maq.api_id = ma.api_id
      WHERE ma.api_path = ? AND ma.prefix = ?`,
    [rest, prefix]
  );
  console.log('[API lookup] rows found:', rows.length);

  if (!rows || !rows.length) {
    throw { code: 'sc009', message: `${path} not found in mas_api` };
  }

  const apiDetails = rows[0];

  if (apiDetails.api_type !== req.method) {
    throw { code: 'sc009', message: `invalid request method for ${path}` };
  }

  // query_id may come back as a bigint/string from the driver — normalize to number.
  if (apiDetails.query_id != null) {
    apiDetails.query_id = Number(apiDetails.query_id);
  }

  // Designation-based access control (only when the API opts in).
  if (apiDetails.is_control_access === 1) {
    const designationId = req.user && (req.user.designation_id || req.user.designationId);
    if (!designationId) {
      throw { code: 'sc009', message: `designation_id required for ${path}` };
    }
    const perm = await dbService.executeQuery(
      adminPool,
      `SELECT m.designation_id, m.access_type, m.custom_value
         FROM map_designation_api m
        WHERE m.api_id = ? AND m.designation_id = ?`,
      [apiDetails.api_id, designationId]
    );
    if (!perm || !perm.length) {
      throw { code: 'sc009', message: `api ${path} not allowed for designation ${designationId}` };
    }
    apiDetails.access_type = perm[0].access_type;
    if (perm[0].access_type === 'C' && perm[0].custom_value) {
      apiDetails.custom_value = JSON.parse(perm[0].custom_value);
    }

    // Best-effort hit counter (don't fail the request if it errors).
    dbService
      .executeQuery(adminPool, 'UPDATE mas_api SET api_hit_count = api_hit_count + 1 WHERE api_id = ?', [
        apiDetails.api_id
      ])
      .catch(() => {});
  }

  return apiDetails;
}

/**
 * Generic dispatcher used by every dynamic route.
 *
 *   service_name : logical group ("list", "master", ...) — used for hand-written services
 *   funcName     : the :function_name path param
 *   ispermreq    : whether the request must be authenticated/authorized
 *
 * JWT is already verified by auth.middleware (req.user is populated). This adds the
 * metadata-driven permission lookup and either runs the auto query or a registered function.
 */
async function commonFunctionToCall(service_name, funcName, req, res, params, ispermreq, resSendCallback) {
  try {
    let apiDetails = {};
    if (ispermreq) {
      apiDetails = await isApiPermissioned(req);
    }

    const sessionDetails = { ...(req.user || {}), ...apiDetails };

    // Auto API: resolve + run the stored query, no endpoint code required.
    if (sessionDetails.api_creation === 'A' && sessionDetails.query_id) {
      const result = await dbService.getQueryDataFromId(req, params, sessionDetails);
      return sendSuccess(result, res, resSendCallback);
    }

    // Otherwise fall back to a hand-written service function, if one is registered.
    const svc = service_files[service_name];
    if (!svc) {
      return sendError({ message: `service "${service_name}" not found` }, res, resSendCallback, 503);
    }
    if (typeof svc[funcName] !== 'function') {
      return sendError({ message: `function "${funcName}" not found` }, res, resSendCallback, 404);
    }
    svc[funcName](req, params, sessionDetails, (err, result) => {
      if (err) return sendError(err, res, resSendCallback, 200);
      return sendSuccess(result, res, resSendCallback);
    });
  } catch (err) {
    const status = err && err.code === 'sc009' ? 403 : 500;
    return sendError(err, res, resSendCallback, status);
  }
}

function sendSuccess(data, res, resSendCallback) {
  if (resSendCallback) return resSendCallback(null, data);
  return res.json({ error: null, data });
}

function sendError(error, res, resSendCallback, status = 500) {
  if (resSendCallback) return resSendCallback(error);
  return res.status(status).json({ error });
}

module.exports = { commonFunctionToCall, isApiPermissioned, service_files };
