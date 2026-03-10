import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  upsertDealerProfileController,
  uploadProfileImage,
  deleteProfileImageController,
  validateUpdateProfile,
  validateUpsertDealerProfile
} from '../controllers/account.controller';
import { requireActiveUser, requireAuth } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(requireAuth, requireActiveUser);

router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put(
  '/dealer-profile',
  validateUpsertDealerProfile,
  upsertDealerProfileController
);
router.post('/profile-image', upload.single('profileImage'), uploadProfileImage);
router.delete('/profile-image', deleteProfileImageController);

export default router;

