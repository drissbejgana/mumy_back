import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { authRoutes } from './routes/auth.routes.js';
import { usersRoutes } from './routes/users.routes.js';
import { vehiclesRoutes } from './routes/vehicles.routes.js';
import { driversRoutes } from './routes/drivers.routes.js';
import { requestsRoutes } from './routes/requests.routes.js';
import { bidsRoutes } from './routes/bids.routes.js';
import { emptyReturnsRoutes } from './routes/emptyReturns.routes.js';
import { financesRoutes } from './routes/finances.routes.js';
import { clientSuppliersRoutes } from './routes/clientSuppliers.routes.js';
import { teamMembersRoutes } from './routes/teamMembers.routes.js';
import { excursionsRoutes } from './routes/excursions.routes.js';
import { websitesRoutes } from './routes/websites.routes.js';
import { excursionBookingsRoutes } from './routes/excursionBookings.routes.js';
import { bannersRoutes } from './routes/banners.routes.js';
import { sentimentAlertsRoutes } from './routes/sentimentAlerts.routes.js';
import { chatsRoutes } from './routes/chats.routes.js';
import { translateRoutes } from './routes/translate.routes.js';
import { geminiRoutes } from './routes/gemini.routes.js';
import { supportRoutes } from './routes/support.routes.js';
import { trackRoutes } from './routes/track.routes.js';
import { env } from './config/env.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/vehicles', vehiclesRoutes);
  app.use('/api/drivers', driversRoutes);
  app.use('/api/requests', requestsRoutes);
  app.use('/api/bids', bidsRoutes);
  app.use('/api/empty-returns', emptyReturnsRoutes);
  app.use('/api/finances', financesRoutes);
  app.use('/api/client-suppliers', clientSuppliersRoutes);
  app.use('/api/team-members', teamMembersRoutes);
  app.use('/api/excursions', excursionsRoutes);
  app.use('/api/websites', websitesRoutes);
  app.use('/api/excursion-bookings', excursionBookingsRoutes);
  app.use('/api/banners', bannersRoutes);
  app.use('/api/sentiment-alerts', sentimentAlertsRoutes);
  app.use('/api/chats', chatsRoutes);
  app.use('/api/translate', translateRoutes);
  app.use('/api/gemini', geminiRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/track', trackRoutes);

  app.use(errorHandler);

  return app;
}
