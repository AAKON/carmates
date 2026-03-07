import { Router } from 'express';
import {
  approveListingHandler,
  deleteListingHandler,
  getListingByIdHandler,
  getListingsHandler,
  getPendingListingsHandler,
  rejectListingHandler,
  updateListingStatusHandler,
  validateReject,
  validateStatus
} from '../controllers/adminListings.controller';
import {
  blockUserHandler,
  listUsersHandler,
  unblockUserHandler
} from '../controllers/adminUsers.controller';
import { getDashboardHandler } from '../controllers/adminDashboard.controller';
import { requireActiveUser, requireAdmin, requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth, requireActiveUser, requireAdmin);

// Listings moderation
router.get('/listings/pending', getPendingListingsHandler);
router.get('/listings', getListingsHandler);
router.get('/listings/:id', getListingByIdHandler);
router.put('/listings/:id/approve', approveListingHandler);
router.put('/listings/:id/reject', validateReject, rejectListingHandler);
router.put('/listings/:id/status', validateStatus, updateListingStatusHandler);
router.delete('/listings/:id', deleteListingHandler);

// Users management
router.get('/users', listUsersHandler);
router.put('/users/:id/block', blockUserHandler);
router.put('/users/:id/unblock', unblockUserHandler);

// Dashboard
router.get('/dashboard', getDashboardHandler);

export default router;

