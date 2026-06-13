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

app.use('/api/hospital', hospitalRoutes);

// Dynamic, metadata-driven APIs (auto GET/list resolved from mas_api + mas_custom_queries).
app.use('/api', frameworkRoutes);

app.get('/', (req, res) => {
  res.send('Medical Cashless Portal API Running');
});

app.listen(process.env.PORT, () => {
  console.log(`Server Running On ${process.env.PORT}`);
});