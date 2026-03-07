import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';

import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';
import dealerRouter from './routes/dealer.routes';
import accountRouter from './routes/account.routes';
import metaRouter from './routes/meta.routes';
import listingsRouter from './routes/listings.routes';
import adminRouter from './routes/admin.routes';
import favoriteRouter from './routes/favorite.routes';
import { UPLOADS_DIR } from './config/paths';
import { stripDangerousKeys } from './middlewares/runtimeSanitizer';
import { authRateLimiter } from './middlewares/rateLimit';

const app = express();

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(
  cors({
    origin: '*',
    credentials: false
  })
);

app.use(helmet());
app.use(express.json());
app.use(stripDangerousKeys);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/health', healthRouter);
app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/dealers', dealerRouter);
app.use('/api/account', accountRouter);
app.use('/api/meta', metaRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/favorites', favoriteRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

