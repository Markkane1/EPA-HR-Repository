import { Router } from 'express';
import { EmployeeModel } from '../models/employee';

const router = Router();

router.get('/', async (req, res) => {
  const employees = await EmployeeModel.find();
  res.json(employees);
});

router.post('/', async (req, res) => {
  const employee = new EmployeeModel(req.body);
  const saved = await employee.save();
  res.status(201).json(saved);
});

router.get('/:id', async (req, res) => {
  const employee = await EmployeeModel.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
});

router.put('/:id', async (req, res) => {
  const updated = await EmployeeModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Employee not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await EmployeeModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Employee not found' });
  res.json({ message: 'Employee deleted' });
});

export default router;
