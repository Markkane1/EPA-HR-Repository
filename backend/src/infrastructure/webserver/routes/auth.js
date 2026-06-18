import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));
router.get('/me', authenticate, controller.me.bind(controller));

export default router;
