import { Router } from 'express';
import { OfficeController } from '../controllers/OfficeController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();
const controller = new OfficeController();

router.get('/', authenticate, controller.index.bind(controller));
router.post('/', authenticate, authorize('offices.write'), controller.create.bind(controller));
router.get('/:id', authenticate, controller.show.bind(controller));
router.put('/:id', authenticate, authorize('offices.write'), controller.update.bind(controller));
router.post('/:id/positions', authenticate, authorize('offices.write'), controller.createPosition.bind(controller));
router.put('/:id/positions/:positionId', authenticate, authorize('offices.write'), controller.updatePosition.bind(controller));
router.delete('/:id/positions/:positionId', authenticate, authorize('offices.write'), controller.deletePosition.bind(controller));

export default router;
