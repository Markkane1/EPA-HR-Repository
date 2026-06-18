import express from 'express';
import { AttachmentController } from '../controllers/AttachmentController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();
const controller = new AttachmentController();

router.post('/', authenticate, authorize('employees.write'), controller.create);
router.patch('/:id/end', authenticate, authorize('employees.write'), controller.end);

export default router;
