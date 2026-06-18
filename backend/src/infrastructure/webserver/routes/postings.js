import { Router } from 'express';
import { PostingController } from '../controllers/PostingController.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
const controller = new PostingController();

router.post('/transfer', authorize('admin'), controller.transfer);

export default router;
