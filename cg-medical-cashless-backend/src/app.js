require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

const hospitalRoutes = require('./modules/hospital/hospital.routes');
const frameworkRoutes = require('./framework/framework.routes');
const reimbursementRoutes = require('./modules/reimbursement/reimbursement.routes');

app.use('/api/hospital', hospitalRoutes);

// Patient Treatment Information (medical reimbursement) — hand-coded endpoints.
app.use('/api', reimbursementRoutes);

// Dynamic, metadata-driven APIs (auto GET/list resolved from mas_api + mas_custom_queries).
app.use('/api', frameworkRoutes);

app.get('/', (req, res) => {
  res.send('Medical Cashless Portal API Running');
});

app.listen(process.env.PORT, () => {
  console.log('=================================================');
  console.log(`Server Running On ${process.env.PORT}`);
  console.log('CWD        :', process.cwd());
  console.log('__dirname  :', __dirname);
  console.log('DB_NAME    :', process.env.DB_NAME);
  console.log('DB_HOST    :', process.env.DB_HOST, 'PORT', process.env.DB_PORT);
  console.log('BUILD MARKER: debug-v2');
  console.log('=================================================');
});