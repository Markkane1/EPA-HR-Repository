import express from 'express';
import { EmployeeController } from '../controllers/EmployeeController.js';
import { PostingController } from '../controllers/PostingController.js';
import { AttachmentController } from '../controllers/AttachmentController.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();
const controller = new EmployeeController();
const postingController = new PostingController();
const attachmentController = new AttachmentController();

router.get('/', controller.index.bind(controller));
router.post('/', authorize('admin'), controller.create.bind(controller));
router.get('/:id', controller.show.bind(controller));
router.put('/:id', authorize('admin'), controller.update.bind(controller));

// Nested routes mapped to other controllers
router.get('/:id/postings', postingController.history);
router.get('/:id/attachments', attachmentController.history);

export default router;
