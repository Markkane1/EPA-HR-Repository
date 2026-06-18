import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { OfficeModel } from '../infrastructure/database/models/OfficeModel.js';
import { PositionModel } from '../infrastructure/database/models/PositionModel.js';
import { SeatModel } from '../infrastructure/database/models/SeatModel.js';
import { EmployeeModel } from '../infrastructure/database/models/EmployeeModel.js';
import { PostingModel } from '../infrastructure/database/models/PostingModel.js';
import { AttachmentModel } from '../infrastructure/database/models/AttachmentModel.js';
import { UserModel } from '../infrastructure/database/models/UserModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/epa_hr';

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('Clearing existing collections...');
    await Promise.all([
      OfficeModel.deleteMany({}),
      PositionModel.deleteMany({}),
      SeatModel.deleteMany({}),
      EmployeeModel.deleteMany({}),
      PostingModel.deleteMany({}),
      AttachmentModel.deleteMany({}),
      UserModel.deleteMany({})
    ]);

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@1234', salt);
    const viewerHash = await bcrypt.hash('Viewer@1234', salt);

    await UserModel.insertMany([
      { name: 'System Admin', email: 'admin@epa.punjab.gov.pk', passwordHash: adminHash, role: 'admin', status: 'active' },
      { name: 'System Viewer', email: 'viewer@epa.punjab.gov.pk', passwordHash: viewerHash, role: 'viewer', status: 'active' }
    ]);

    console.log('Collections cleared. Seeding Offices...');
    const officeData = [
      { id: randomUUID(), name: 'EPA Headquarters Lahore', type: 'Directorate', location: 'Lahore', district: 'Lahore' },
      { id: randomUUID(), name: 'EPA Regional Office Faisalabad', type: 'Regional Office', location: 'Faisalabad', district: 'Faisalabad' },
      { id: randomUUID(), name: 'EPA Field Office Multan', type: 'Field Office', location: 'Multan', district: 'Multan' },
      { id: randomUUID(), name: 'EPA Directorate Rawalpindi', type: 'Directorate', location: 'Rawalpindi', district: 'Rawalpindi' }
    ];
    const offices = await OfficeModel.insertMany(officeData);

    console.log('Seeding Positions and Seats...');
    const positions = [];
    const seats = [];
    let seatCounter = 1;

    for (const office of offices) {
      const officePositions = [
        { id: randomUUID(), officeId: office.id, title: 'Director', basicScale: 18, totalSeats: 2 },
        { id: randomUUID(), officeId: office.id, title: 'Assistant Director', basicScale: 17, totalSeats: 3 },
        { id: randomUUID(), officeId: office.id, title: 'Inspector', basicScale: 14, totalSeats: 3 }
      ];
      
      for (const pos of officePositions) {
        positions.push(pos);
        for (let i = 0; i < pos.totalSeats; i++) {
          seats.push({
            id: randomUUID(),
            positionId: pos.id,
            officeId: office.id,
            seatNumber: seatCounter++,
            status: 'vacant'
          });
        }
      }
    }
    await PositionModel.insertMany(positions);
    const savedSeats = await SeatModel.insertMany(seats);

    console.log('Seeding Employees...');
    const names = ['Ali Raza', 'Muhammad Usman', 'Ayesha Khan', 'Fatima Tariq', 'Hamza Ali', 'Bilal Ahmed', 'Zainab Bibi', 'Hafiz Waqas', 'Imran Shah', 'Sana Iqbal', 'Tariq Mehmood', 'Usama Khalid', 'Rabia Noor', 'Kamran Akmal', 'Farhan Saeed'];
    const cnics = ['35202-1234567-1', '35202-2345678-2', '35202-3456789-3', '35202-4567890-4', '35202-5678901-5', '35202-6789012-6', '35202-7890123-7', '35202-8901234-8', '35202-9012345-9', '35202-0123456-0', '35202-1111111-1', '35202-2222222-2', '35202-3333333-3', '35202-4444444-4', '35202-5555555-5'];
    
    const employeesData = names.map((name, index) => ({
      id: randomUUID(),
      name,
      fatherName: 'Abdullah',
      cnic: cnics[index],
      dob: new Date('1990-01-01'),
      dateOfJoining: new Date('2015-06-15'),
      basicScale: 17,
      status: 'active'
    }));
    const employees = await EmployeeModel.insertMany(employeesData);

    console.log('Creating Current Postings...');
    const postings = [];
    const occupiedSeatIds = new Set();
    
    for (let i = 0; i < 15; i++) {
      const emp = employees[i];
      const seat = savedSeats[i]; // assign first 15 seats
      occupiedSeatIds.add(seat.id);
      
      postings.push({
        id: randomUUID(),
        employeeId: emp.id,
        seatId: seat.id,
        officeId: seat.officeId,
        positionId: seat.positionId,
        effectiveFrom: new Date('2023-01-01'),
        effectiveTo: null,
        orderNumber: `EPA-${1000 + i}`
      });
    }

    console.log('Creating Past Postings (for 5 employees)...');
    for (let i = 0; i < 5; i++) {
      const emp = employees[i];
      postings.push({
        id: randomUUID(),
        employeeId: emp.id,
        seatId: savedSeats[20].id, // dummy old seat
        officeId: savedSeats[20].officeId,
        positionId: savedSeats[20].positionId,
        effectiveFrom: new Date('2018-01-01'),
        effectiveTo: new Date('2022-12-31'),
        orderNumber: `EPA-OLD-${1000 + i}`
      });
    }
    await PostingModel.insertMany(postings);

    console.log('Creating Attachments (for 4 employees)...');
    const attachments = [];
    for (let i = 0; i < 4; i++) {
      const emp = employees[i];
      // Attach to a different office (office 3)
      attachments.push({
        id: randomUUID(),
        employeeId: emp.id,
        officeId: offices[3].id,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: null,
        orderNumber: `ATT-${100 + i}`,
        reason: 'Special Duty'
      });
    }
    await AttachmentModel.insertMany(attachments);

    console.log('Updating occupied seats...');
    await SeatModel.updateMany({ id: { $in: Array.from(occupiedSeatIds) } }, { status: 'occupied' });

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
