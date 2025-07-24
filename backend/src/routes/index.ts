import { Router } from 'express';
import itemsController from '../controllers/items.controller';

const router = Router();

router.use('/items', itemsController);

export default router;
