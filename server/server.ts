import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import officeRoutes from './routes/offices';
import positionRoutes from './routes/positions';
import seatRoutes from './routes/seats';
import employeeRoutes from './routes/employees';
import postingRoutes from './routes/postings';
import attachmentRoutes from './routes/attachments';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

app.use('/api/offices', officeRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/postings', postingRoutes);
app.use('/api/attachments', attachmentRoutes);

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
