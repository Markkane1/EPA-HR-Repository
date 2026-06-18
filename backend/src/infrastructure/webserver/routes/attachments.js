import express from 'express';
import { AttachmentController } from '../controllers/AttachmentController.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();
const controller = new AttachmentController();

router.post('/', authorize('admin'), controller.create);
router.patch('/:id/end', authorize('admin'), controller.end);

export default router;
