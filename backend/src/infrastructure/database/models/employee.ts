import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  doj: { type: String, required: true },
  scale: { type: String, required: true },
  contactNumber: { type: String, required: true },
  photoColor: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },
}, {
  timestamps: true,
});

export const EmployeeModel = mongoose.model('Employee', employeeSchema);
