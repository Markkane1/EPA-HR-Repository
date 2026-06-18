import { Router } from 'express';
import { OfficeModel } from '../models/office';
import { PositionModel } from '../models/position';
import { SeatModel } from '../models/seat';
import { EmployeeModel } from '../models/employee';
import { PostingModel } from '../models/posting';
import { AttachmentModel } from '../models/attachment';
import {
  initialOffices,
  initialPositions,
  initialSeats,
  initialEmployees,
  initialPostings,
  initialAttachments,
} from '../data/seedData';

const router = Router();

const seedCollections = async () => {
  await Promise.all([
    OfficeModel.deleteMany({}),
    PositionModel.deleteMany({}),
    SeatModel.deleteMany({}),
    EmployeeModel.deleteMany({}),
    PostingModel.deleteMany({}),
    AttachmentModel.deleteMany({}),
  ]);

  const [offices, positions, seats, employees, postings, attachments] = await Promise.all([
    OfficeModel.insertMany(initialOffices),
    PositionModel.insertMany(initialPositions),
    SeatModel.insertMany(initialSeats),
    EmployeeModel.insertMany(initialEmployees),
    PostingModel.insertMany(initialPostings),
    AttachmentModel.insertMany(initialAttachments),
  ]);

  return { offices, positions, seats, employees, postings, attachments };
};

router.get('/status', async (_req, res) => {
  const [offices, positions, seats, employees, postings, attachments] = await Promise.all([
    OfficeModel.countDocuments(),
    PositionModel.countDocuments(),
    SeatModel.countDocuments(),
    EmployeeModel.countDocuments(),
    PostingModel.countDocuments(),
    AttachmentModel.countDocuments(),
  ]);

  res.json({ offices, positions, seats, employees, postings, attachments });
});

router.post('/seed', async (_req, res) => {
  try {
    const seeded = await seedCollections();
    res.status(201).json({ message: 'Seed data loaded successfully.', ...seeded });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed database.', error: (error as Error).message });
  }
});

export default router;
