import { Router } from 'express';
import { OfficeController } from '../controllers/OfficeController.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
const controller = new OfficeController();

router.get('/', controller.index.bind(controller));
router.post('/', authorize('admin'), controller.create.bind(controller));
router.get('/:id', controller.show.bind(controller));
router.put('/:id', authorize('admin'), controller.update.bind(controller));
router.post('/:id/positions', authorize('admin'), controller.createPosition.bind(controller));

export default router;
