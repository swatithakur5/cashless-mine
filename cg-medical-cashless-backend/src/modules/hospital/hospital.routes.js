const express = require('express');
const router = express.Router();

const hospitalController = require('./hospital.controller');

router.post(
  '/login',
  hospitalController.login
);

router.get(
 '/dashboard/:employee_code',
 hospitalController.getDashboardData
);
router.post('/verify-otp', (req,res)=>{
   return res.json({
      success:true
   });
});
module.exports = router;