import { UserRepository } from '../../database/repositories/UserRepository.js';
import { GetAllUsers } from '../../../application/usecases/GetAllUsers.js';
import { UpdateUser } from '../../../application/usecases/UpdateUser.js';
import { RegisterUser } from '../../../application/usecases/RegisterUser.js';

export class UserController {
  async index(req, res) {
    try {
      const useCase = new GetAllUsers(new UserRepository());
      const users = await useCase.execute();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const useCase = new RegisterUser(new UserRepository());
      const user = await useCase.execute(req.body);
      res.status(201).json({ id: user.id, name: user.name, email: user.email, roleId: user.roleId, role: user.role, status: user.status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const useCase = new UpdateUser(new UserRepository());
      const user = await useCase.execute(req.params.id, req.body);
      res.json({ id: user.id, name: user.name, email: user.email, roleId: user.roleId, role: user.role, officeId: user.officeId, status: user.status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      // Prevent deleting self
      if (req.user.userId === req.params.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }
      const userRepo = new UserRepository();
      const existing = await userRepo.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'User not found' });
      await userRepo.delete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
