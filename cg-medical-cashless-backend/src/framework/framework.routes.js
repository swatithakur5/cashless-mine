const express = require('express');
const router = express.Router();

const securityService = require('./securityService');
const auth = require('../middleware/auth.middleware');

// All dynamic routes require a valid JWT (auth.middleware populates req.user).

// Auto GET list — filters come from the query string.
//   GET /api/list/get/getHospitalList?city=Raipur
router.get('/list/get/:function_name', auth, (req, res) => {
  securityService.commonFunctionToCall('list', req.params.function_name, req, res, req.query, true);
});

// Auto list with filters in the body (useful for large/complex filter payloads).
//   POST /api/list/post/getHospitalList   body: { city: "Raipur" }
router.post('/list/post/:function_name', auth, (req, res) => {
  securityService.commonFunctionToCall('list', req.params.function_name, req, res, req.body, true);
});

// Generic master read endpoint (same engine, different logical group).
//   GET /api/master/get/getDesignations
router.get('/master/get/:function_name', auth, (req, res) => {
  securityService.commonFunctionToCall('master', req.params.function_name, req, res, req.query, true);
});

module.exports = router;
