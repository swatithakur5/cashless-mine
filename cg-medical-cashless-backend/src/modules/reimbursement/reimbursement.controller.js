const fs = require('fs');
const path = require('path');
const db = require('../../config/db');

// Every dynamic-engine endpoint in the source app answered with this envelope:
//   success -> { error: null, data: [...] }
//   failure -> { error: { message } }
// The Angular frontend checks `res.body.error` and reads `res.body.data`, so we mirror it.
function ok(res, data) {
  return res.json({ error: null, data });
}
function fail(res, err, status = 500) {
  console.error('[reimbursement] error:', err && (err.message || err));
  return res.status(status).json({ error: { message: (err && err.message) || 'Something went wrong' } });
}

// Small helper: run a parameterized query on the business pool and release the connection.
async function query(sql, params = []) {
  let conn;
  try {
    conn = await db.getConnection();
    return await conn.query(sql, params);
  } finally {
    if (conn) conn.release();
  }
}

// Treat '', 'null', null, undefined, -1 as "not supplied" (same rule the source engine used).
function clean(v) {
  if (v === '' || v === 'null' || v === null || v === undefined || v === -1 || v === '-1') return null;
  return v;
}

/* ============================ MASTER READS ============================ */
// SQL strings below are copied from the reimbursement app's mas_custom_queries.

exports.getMasTreatmentType = async (req, res) => {
  try {
    const rows = await query(
      'SELECT mtt.treatment_type_code, mtt.treatment_type_short_name_en FROM mr_mas_treatment_type mtt'
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

exports.getMasIpdType = async (req, res) => {
  try {
    const rows = await query(
      'SELECT mmtd.ipd_type_code, mmtd.ipd_name_en, mmtd.ipd_name_hi FROM mr_mas_ipd_type_details mmtd'
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

exports.getMasProcedureType = async (req, res) => {
  try {
    const rows = await query(
      'SELECT mpt.procedure_type_code, mpt.procedure_type_name_en, mpt.procedure_type_name_hi FROM mr_mas_procedure_type mpt'
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

// Initial load returns everything; supports filtering by procedure_type_code,
// a procedure_name_en text search, or a procedure_code prefix (matches the UI's checkInputType).
exports.getMasProcedureDetailsByTypeCode = async (req, res) => {
  try {
    let sql =
      'SELECT mpd.procedure_code, mpd.procedure_type_code, mpd.procedure_name_en, mpd.procedure_name_hi, mpd.non_nabh_nabl, mpd.nabh_nabl FROM mr_mas_procedure_details mpd';
    const where = [];
    const params = [];

    const procTypeCode = clean(req.query.procedure_type_code);
    const procName = clean(req.query.procedure_name_en);
    const procCode = clean(req.query.procedure_code);

    if (procTypeCode !== null) { where.push('mpd.procedure_type_code = ?'); params.push(procTypeCode); }
    if (procName !== null) { where.push("mpd.procedure_name_en LIKE CONCAT('%', ?, '%')"); params.push(procName); }
    if (procCode !== null) { where.push("CAST(mpd.procedure_code AS CHAR) LIKE CONCAT('%', ?, '%')"); params.push(procCode); }

    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' LIMIT 500';

    const rows = await query(sql, params);
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

exports.getMasDistrictDetails = async (req, res) => {
  try {
    const rows = await query(
      'SELECT md.district_code, md.district_name_en FROM mr_mas_district md WHERE md.state_code = 22'
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

exports.getMasHospitalDetails = async (req, res) => {
  try {
    const districtCode = clean(req.query.district_code);
    const rows = await query(
      'SELECT mhd.hospital_code, mhd.reg_no, mhd.hospital_name_en, mhd.district_code, mhd.district_id FROM mr_mas_hospital_details mhd WHERE mhd.district_code = ?',
      [districtCode]
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

exports.getMasDocumentDetails = async (req, res) => {
  try {
    const rows = await query(
      'SELECT doc.document_code, doc.form_control_name, doc.document_name, doc.is_required, doc.icon, doc.title FROM mr_mas_document_details doc WHERE doc.is_active = 1 ORDER BY doc.document_code'
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

/* ============================ EMPLOYEE READS ============================ */

exports.getEmpDetailsByEmpCode = async (req, res) => {
  try {
    const empCode = clean(req.query.emp_code);
    const rows = await query(
      `SELECT ebd.emp_code, ebd.name_en, dd.name_en AS designation_name, dd.designaton_code
         FROM mr_emp_basic_details ebd
         LEFT JOIN deptwise_designation dd ON ebd.ekarmik_designation_code = dd.designaton_code
        WHERE ebd.emp_code = ?`,
      [empCode]
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

// Self + family members. Enriched with relation_code (joined from mr_mas_relation)
// because the patient dropdown binds relation_code for the save payload.
exports.getRelationDetailsByEmpCode = async (req, res) => {
  try {
    const empCode = clean(req.query.emp_code);
    const rows = await query(
      `SELECT emp_code, name_en COLLATE utf8mb4_unicode_ci AS name, 'SELF' AS relation, 8 AS relation_code
         FROM mr_emp_basic_details
        WHERE emp_code = ?
       UNION ALL
       SELECT f.emp_code, f.name COLLATE utf8mb4_unicode_ci AS name,
              f.relation COLLATE utf8mb4_unicode_ci AS relation,
              COALESCE(r.relation_code, 0) AS relation_code
         FROM mr_emp_family_details f
         LEFT JOIN mr_mas_relation r ON UPPER(r.relation_name_en) = UPPER(f.relation)
        WHERE f.emp_code = ?`,
      [empCode, empCode]
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

/* ============================ STATE-ADMIN READ ============================ */
// The source app had an empty service for this; the page only needs an office-admin
// row (its emp_code becomes reporting_officer_code). We resolve it from the DDO.
exports.getAuthDesignationDetails = async (req, res) => {
  try {
    const ddoCode = clean(req.query.ddo_code);
    const rows = await query(
      `SELECT emp_code, name_en, ddo_code, ekarmik_designation_code AS designation_id
         FROM mr_emp_basic_details
        WHERE ddo_code = ?
        ORDER BY emp_code
        LIMIT 1`,
      [ddoCode]
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e); }
};

/* ============================ SAVE (multipart) ============================ */
// Faithful port of employeeService.saveMedicalReimbursement: one transaction that
// writes the application, its treatment rows, uploaded documents, and the workflow row.
exports.saveMedicalReimbursement = async (req, res) => {
  const body = req.body || {};

  // --- basicDetails.* ---
  const basic = {};
  Object.keys(body).forEach((k) => {
    if (k.startsWith('basicDetails.')) basic[k.replace('basicDetails.', '')] = body[k];
  });
  if (basic.reporting_officer_code === 'undefined' || basic.reporting_officer_code === undefined) {
    basic.reporting_officer_code = null;
  }

  // --- treatmentDetails.N (each a JSON string) ---
  const treatmentDetails = [];
  Object.keys(body).forEach((k) => {
    if (k.startsWith('treatmentDetails.')) {
      const idx = k.split('.')[1];
      try { treatmentDetails[idx] = JSON.parse(body[k]); } catch (_) { /* ignore bad row */ }
    }
  });

  // --- documents metadata + uploaded files ---
  let documentsMetadata = [];
  try { documentsMetadata = body.documents ? JSON.parse(body.documents) : []; } catch (_) { documentsMetadata = []; }
  const uploadedFiles = req.files || {};

  // emp identity comes from the JWT (hospital login -> employee_code)
  const empId = req.user && (req.user.employee_code || req.user.emp_id);
  const ipAddress = req.ip || '';

  if (!Array.isArray(treatmentDetails) || treatmentDetails.filter(Boolean).length === 0) {
    return fail(res, { message: 'Treatment details missing' }, 400);
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1) main application row
    const insApply = await conn.query(
      `INSERT INTO mr_emp_medical_reimbursement_apply
         (emp_code, patient_name, relation_code, relation_name, total_amount, disease_name,
          reporting_officer_code, status, current_stage, created_by, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 'OFFICE_ADMIN', ?, ?)`,
      [
        empId,
        basic.patient_name || '',
        Number(basic.relation_code) || 0,
        basic.relation_name || null,
        Number(basic.total_amount) || 0,
        basic.disease_name || null,
        basic.reporting_officer_code || null,
        empId,
        ipAddress
      ]
    );
    const applicationCode = Number(insApply.insertId);

    // 2) treatment detail rows
    for (const row of treatmentDetails.filter(Boolean)) {
      await conn.query(
        `INSERT INTO mr_emp_medical_reimbursement_apply_details
           (application_code, treatment_type_code, ipd_type_code, procedure_type_code, procedure_code,
            district_code, hospital_code, receipt_no, receipt_date, claim_amount, quantity,
            hospital_type, is_recognised, treatment_from_date, treatment_to_date, total_days,
            disease_name, created_by, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationCode,
          clean(row.treatment_type_code),
          clean(row.ipd_type_code),
          clean(row.procedure_type_code),
          clean(row.procedure_code),
          clean(row.district_code),
          clean(row.hospital_code),
          row.receipt_no || '',
          clean(row.receipt_date),
          Number(row.claim_amount) || 0,
          Number(row.quantity) || 0,
          clean(row.hospital_type),
          clean(row.is_recognised),
          clean(row.treatment_from_date),
          clean(row.treatment_to_date),
          clean(row.total_days),
          clean(row.disease_name),
          empId,
          ipAddress
        ]
      );
    }

    // 3) documents: persist each PDF and record it. Files arrive as file_0, file_1, ...
    //    in the same order as documentsMetadata.
    if (documentsMetadata.length) {
      const uploadDir = path.join(__dirname, '..', '..', '..', 'upload', 'medical_reimbursement');
      fs.mkdirSync(uploadDir, { recursive: true });
      const fileKeys = Object.keys(uploadedFiles);

      for (let i = 0; i < documentsMetadata.length; i++) {
        const docMeta = documentsMetadata[i];
        const fileObj = uploadedFiles[fileKeys[i]];
        if (!fileObj) continue;

        const fileName = `${applicationCode}_${docMeta.document_code}`;
        const relPath = `medical_reimbursement/${fileName}.pdf`;
        fs.writeFileSync(path.join(uploadDir, `${fileName}.pdf`), fileObj.data);

        await conn.query(
          `INSERT INTO mr_emp_medical_remiburement_doc_details
             (application_code, emp_code, doc_type, doc_path, doc_name, created_by, ip_address)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [applicationCode, empId, docMeta.document_code, relPath, fileName, empId, ipAddress]
        );
      }
    }

    // 4) workflow row (application enters the OFFICE_ADMIN stage)
    await conn.query(
      `INSERT INTO medical_reimbursement_applications
         (application_id, emp_id, current_stage, status, pending_with, previous_stage, last_action_by, total_amount)
       VALUES (?, ?, 'OFFICE_ADMIN', 'PENDING', ?, 'EMPLOYEE', ?, ?)`,
      [applicationCode, empId, basic.reporting_officer_code || null, empId, Number(basic.total_amount) || 0]
    );

    await conn.commit();
    return ok(res, { application_code: applicationCode, message: 'Insert successfully' });
  } catch (e) {
    if (conn) { try { await conn.rollback(); } catch (_) {} }
    return fail(res, e);
  } finally {
    if (conn) conn.release();
  }
};
