import { UserRepository } from '../../database/repositories/UserRepository.js';
import { RegisterUser } from '../../../application/usecases/RegisterUser.js';
import { LoginUser } from '../../../application/usecases/LoginUser.js';
import { GetCurrentUser } from '../../../application/usecases/GetCurrentUser.js';

export class AuthController {
  async register(req, res) {
    try {
      const useCase = new RegisterUser(new UserRepository());
      const user = await useCase.execute(req.body);
      res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const useCase = new LoginUser(new UserRepository());
      const data = await useCase.execute({ email: req.body.email, password: req.body.password });
      res.json(data);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async me(req, res) {
    try {
      const useCase = new GetCurrentUser(new UserRepository());
      const user = await useCase.execute(req.user.userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
