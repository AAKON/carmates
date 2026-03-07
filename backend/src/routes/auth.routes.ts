import { Router } from 'express';
import { requireAuth, requireActiveUser } from '../middlewares/auth';
import {
  login,
  logout,
  me,
  register,
  validateLogin,
  validateRegister
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', requireAuth, requireActiveUser, me);
router.post('/logout', logout);

export default router;

