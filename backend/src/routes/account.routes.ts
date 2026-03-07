import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  upsertDealerProfileController,
  validateUpdateProfile,
  validateUpsertDealerProfile
} from '../controllers/account.controller';
import { requireActiveUser, requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth, requireActiveUser);

router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put(
  '/dealer-profile',
  validateUpsertDealerProfile,
  upsertDealerProfileController
);

export default router;

