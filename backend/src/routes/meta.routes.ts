import { Router } from 'express';
import {
  getMakes,
  getModels,
  validateModelsQuery
} from '../controllers/meta.controller';

const router = Router();

router.get('/makes', getMakes);
router.get('/models', validateModelsQuery, getModels);

export default router;

