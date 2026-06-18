import { Router } from 'express';
import { PostingController } from '../controllers/PostingController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
const controller = new PostingController();

router.post('/transfer', authenticate, authorize('employees.write'), controller.transfer);

export default router;
