import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import officeRoutes from './infrastructure/webserver/routes/offices.js';
import employeeRoutes from './infrastructure/webserver/routes/employees.js';
import postingRoutes from './infrastructure/webserver/routes/postings.js';
import attachmentRoutes from './infrastructure/webserver/routes/attachments.js';
import dashboardRoutes from './infrastructure/webserver/routes/dashboard.js';
import authRoutes from './infrastructure/webserver/routes/auth.js';
import roleRoutes from './infrastructure/webserver/routes/roles.js';
import userRoutes from './infrastructure/webserver/routes/users.js';
import { authenticate } from './infrastructure/webserver/middlewares/authenticate.js';
import { seedDefaultRoles } from './config/seed.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Security Middlewares
app.use(helmet());
app.use(mongoSanitize());

// Restrict CORS
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(globalLimiter);

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
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

connectDatabase()
  .then(async () => {
    await seedDefaultRoles();
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
