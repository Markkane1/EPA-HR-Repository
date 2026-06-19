import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();
const controller = new AuthController();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
});

router.post('/register', authLimiter, controller.register.bind(controller));
router.post('/login', authLimiter, controller.login.bind(controller));
router.get('/me', authenticate, controller.me.bind(controller));

export default router;
