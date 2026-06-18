import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
const controller = new UserController();

router.get('/', authenticate, authorize('users.read'), controller.index.bind(controller));
router.post('/', authenticate, authorize('users.write'), controller.create.bind(controller));
router.put('/:id', authenticate, authorize('users.write'), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize('users.write'), controller.delete.bind(controller));

export default router;
