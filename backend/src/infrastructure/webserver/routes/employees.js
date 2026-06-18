import express from 'express';
import { EmployeeController } from '../controllers/EmployeeController.js';
import { PostingController } from '../controllers/PostingController.js';
import { AttachmentController } from '../controllers/AttachmentController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();
const controller = new EmployeeController();
const postingController = new PostingController();
const attachmentController = new AttachmentController();

router.get('/', authenticate, controller.index.bind(controller));
router.post('/', authenticate, authorize('employees.write'), controller.create.bind(controller));
router.get('/:id', authenticate, controller.show.bind(controller));
router.put('/:id', authenticate, authorize('employees.write'), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize('employees.write'), controller.delete.bind(controller));

// Nested routes mapped to other controllers
router.get('/:id/postings', authenticate, postingController.history);
router.get('/:id/attachments', authenticate, attachmentController.history);

export default router;
