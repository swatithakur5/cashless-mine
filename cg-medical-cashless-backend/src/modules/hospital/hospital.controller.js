const db = require('../../config/db');
const { generateToken } = require('../../config/jwt');

exports.login = async (req, res) => {

  let conn;

  try {

    const { employee_code, mobile_number } = req.body;

    if (!employee_code || !mobile_number) {
      return res.status(400).json({
        success: false,
        message: 'Employee Code and Mobile Number Required'
      });
    }

    conn = await db.getConnection();

    await conn.query(
      `INSERT INTO hospital_employee_login (employee_code, mobile_number) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE mobile_number = VALUES(mobile_number)`,
      [employee_code, mobile_number]
    );

    const token = generateToken({
      employee_code,
      role: 'hospital'
    });

    return res.status(200).json({
      success: true,
      message: 'Login Successful',
      token
    });

  } catch (error) {

    console.log('ERROR =>', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  } finally {

    if (conn) conn.release();
  }
};

exports.getDashboardData = async (req, res) => {

  let conn;

  try {

    const { employee_code } = req.params;

    conn = await db.getConnection();

    const rows = await conn.query(
      `
      SELECT
          hel.employee_code,
          hel.mobile_number,
          har.id,
          har.hospital_name,
          har.relation_name,
          har.from_date,
          har.to_date,
          har.amount,
          har.status
      FROM hospital_employee_login hel
      INNER JOIN hospital_authorization_requests har
          ON hel.employee_code = har.employee_code
      WHERE hel.employee_code = ?
      `,
      [employee_code]
    );

    return res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  } finally {

    if (conn) conn.release();

  }
};