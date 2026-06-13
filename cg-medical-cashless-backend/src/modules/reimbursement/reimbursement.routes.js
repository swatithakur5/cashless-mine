const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();

const auth = require('../../middleware/auth.middleware');
const ctrl = require('./reimbursement.controller');

// All reimbursement endpoints require a valid JWT (the hospital login token).
// Paths mirror the source app exactly so the ported Angular component is unchanged:
//   /api/mrMaster/get/...   /api/employee/get/...   /api/stateAdmin/get/...   /api/employee/postFile/...

// ---- master reads ----
router.get('/mrMaster/get/getMasTreatmentType', auth, ctrl.getMasTreatmentType);
router.get('/mrMaster/get/getMasIpdType', auth, ctrl.getMasIpdType);
router.get('/mrMaster/get/getMasProcedureType', auth, ctrl.getMasProcedureType);
router.get('/mrMaster/get/getMasProcedureDetailsByTypeCode', auth, ctrl.getMasProcedureDetailsByTypeCode);
router.get('/mrMaster/get/getMasDistrictDetails', auth, ctrl.getMasDistrictDetails);
router.get('/mrMaster/get/getMasHospitalDetails', auth, ctrl.getMasHospitalDetails);
router.get('/mrMaster/get/getMasDocumentDetails', auth, ctrl.getMasDocumentDetails);

// ---- employee reads ----
router.get('/employee/get/getEmpDetailsByEmpCode', auth, ctrl.getEmpDetailsByEmpCode);
router.get('/employee/get/getRelationDetailsByEmpCode', auth, ctrl.getRelationDetailsByEmpCode);

// ---- state-admin read ----
router.get('/stateAdmin/get/getAuthDesignationDetails', auth, ctrl.getAuthDesignationDetails);

// ---- save (multipart: text fields + PDF files) ----
router.post(
  '/employee/postFile/saveMedicalReimbursement',
  auth,
  fileUpload(),
  ctrl.saveMedicalReimbursement
);

module.exports = router;
