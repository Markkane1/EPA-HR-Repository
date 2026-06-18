import mongoose from 'mongoose';

export const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  fatherName: { type: String },
  cnic: { type: String, required: true, unique: true },
  dob: { type: Date },
  dateOfJoining: { type: Date },
  basicScale: { type: Number },
  contactNumber: { type: String },
  photoUrl: { type: String },
  status: { type: String, enum: ['active', 'retired', 'transferred'], default: 'active' }
}, {
  timestamps: true
});

export const EmployeeModel = mongoose.model('Employee', employeeSchema);
