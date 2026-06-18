import { Router } from 'express';
import { RoleController } from '../controllers/RoleController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
const controller = new RoleController();

// All role management requires being a system admin
router.get('/', authenticate, controller.index.bind(controller));
router.post('/', authenticate, authorize('roles.write'), controller.create.bind(controller));
router.put('/:id', authenticate, authorize('roles.write'), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize('roles.write'), controller.delete.bind(controller));

export default router;
