import { Router } from 'express';
import {
  addPhotosHandler,
  changeStatusHandler,
  createListingHandler,
  getMyListingsHandler,
  getPublicListingHandler,
  listDealerLiveListingsHandler,
  deletePhotosHandler,
  reorderPhotosHandler,
  searchPublicListingsHandler,
  validateCreateListing,
  validateDeletePhotos,
  validateReorderPhotos,
  validateStatusChange,
  validateUpdateListing,
  updateListingHandler
} from '../controllers/listings.controller';
import { optionalAuth, requireActiveUser, requireAuth } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public (with optional auth so owners can see their own non-live listings)
router.get('/', searchPublicListingsHandler);
router.get('/:id', optionalAuth, getPublicListingHandler);

// Dealer listings (public)
router.get(
  '/dealer/:dealerId',
  listDealerLiveListingsHandler
); // NOTE: spec path /api/dealers/:dealerId/listings handled under dealer router

// Authenticated listing management
router.use(requireAuth, requireActiveUser);

router.get('/mine/all', getMyListingsHandler);
router.post('/', validateCreateListing, createListingHandler);
router.put('/:id', validateUpdateListing, updateListingHandler);
router.post(
  '/:id/photos',
  upload.array('photos', 20),
  addPhotosHandler
);
router.delete(
  '/:id/photos',
  validateDeletePhotos,
  deletePhotosHandler
);
router.put(
  '/:id/photos/reorder',
  validateReorderPhotos,
  reorderPhotosHandler
);
router.put('/:id/status', validateStatusChange, changeStatusHandler);

export default router;

