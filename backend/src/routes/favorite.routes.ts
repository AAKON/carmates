import { Router } from 'express';
import { z } from 'zod';
import {
  getFavoriteIdsHandler,
  listFavoritesHandler,
  removeFavoriteHandler,
  saveFavoriteHandler
} from '../controllers/favorite.controller';
import { requireActiveUser, requireAuth } from '../middlewares/auth';
import { validateRequest } from '../utils/validation';

const router = Router();

const idParamsSchema = z.object({
  listingId: z.string().min(1)
});

router.use(requireAuth, requireActiveUser);

router.get('/', listFavoritesHandler);
router.get('/ids', getFavoriteIdsHandler);
router.post('/:listingId', validateRequest({ params: idParamsSchema }), saveFavoriteHandler);
router.delete(
  '/:listingId',
  validateRequest({ params: idParamsSchema }),
  removeFavoriteHandler
);

export default router;

