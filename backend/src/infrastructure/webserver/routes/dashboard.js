import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';

const router = express.Router();
const controller = new DashboardController();

router.get('/stats', controller.stats);

export default router;
