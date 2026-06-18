import { RoleRepository } from '../../database/repositories/RoleRepository.js';
import { GetAllRoles } from '../../../application/usecases/GetAllRoles.js';
import { CreateRole } from '../../../application/usecases/CreateRole.js';
import { UpdateRole } from '../../../application/usecases/UpdateRole.js';
import { DeleteRole } from '../../../application/usecases/DeleteRole.js';

export class RoleController {
  async index(req, res) {
    try {
      const useCase = new GetAllRoles(new RoleRepository());
      const roles = await useCase.execute();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const useCase = new CreateRole(new RoleRepository());
      const role = await useCase.execute(req.body);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const useCase = new UpdateRole(new RoleRepository());
      const role = await useCase.execute(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const useCase = new DeleteRole(new RoleRepository());
      await useCase.execute(req.params.id);
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
