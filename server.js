require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');

const app = express();


app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('/{*path}', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/auth', authRoutes);      
app.use('/api/profile', profileRoutes); 


app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  const networkIP =
    require('os').networkInterfaces()['en0']?.find((i) => i.family === 'IPv4')?.address ||
    'check-your-ip';
  console.log(`Server running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://${networkIP}:${PORT}`);
});
