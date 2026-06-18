import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import officeRoutes from './infrastructure/webserver/routes/offices.js';
import employeeRoutes from './infrastructure/webserver/routes/employees.js';
import postingRoutes from './infrastructure/webserver/routes/postings.js';
import attachmentRoutes from './infrastructure/webserver/routes/attachments.js';
import dashboardRoutes from './infrastructure/webserver/routes/dashboard.js';
import authRoutes from './infrastructure/webserver/routes/auth.js';
import { authenticate } from './infrastructure/webserver/middlewares/authenticate.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

// Global Authentication Middleware
app.use((req, res, next) => {
  if (req.path === '/api/health' || req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next();
  }
  if (req.path.startsWith('/api/')) {
    return authenticate(req, res, next);
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/postings', postingRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
