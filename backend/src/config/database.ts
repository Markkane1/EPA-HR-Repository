import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/epa_hr';

export const connectDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  mongoose.set('strictQuery', false);

  await mongoose.connect(MONGODB_URI, {
    autoIndex: true,
  });

  console.log(`MongoDB connected: ${MONGODB_URI}`);
};
