import { Router } from 'express';
import { z } from 'zod';
import { getDealerPublic } from '../controllers/dealer.controller';
import { listDealerLiveListingsHandler } from '../controllers/listings.controller';
import { validateRequest } from '../utils/validation';

const router = Router();

const dealerParamsSchema = z.object({
  dealerId: z.string().min(1)
});

router.get(
  '/:dealerId',
  validateRequest({ params: dealerParamsSchema }),
  getDealerPublic
);
router.get(
  '/:dealerId/listings',
  validateRequest({ params: dealerParamsSchema }),
  listDealerLiveListingsHandler
);

export default router;

