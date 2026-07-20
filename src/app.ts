import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiters';
import { authRoutes } from './routes/auth.routes';
import { usersRoutes } from './routes/users.routes';
import { vehiclesRoutes } from './routes/vehicles.routes';
import { driversRoutes } from './routes/drivers.routes';
import { requestsRoutes } from './routes/requests.routes';
import { bidsRoutes } from './routes/bids.routes';
import { emptyReturnsRoutes } from './routes/emptyReturns.routes';
import { financesRoutes } from './routes/finances.routes';
import { clientSuppliersRoutes } from './routes/clientSuppliers.routes';
import { teamMembersRoutes } from './routes/teamMembers.routes';
import { excursionsRoutes } from './routes/excursions.routes';
import { websitesRoutes } from './routes/websites.routes';
import { excursionBookingsRoutes } from './routes/excursionBookings.routes';
import { bannersRoutes } from './routes/banners.routes';
import { sentimentAlertsRoutes } from './routes/sentimentAlerts.routes';
import { chatsRoutes } from './routes/chats.routes';
import { translateRoutes } from './routes/translate.routes';
import { geminiRoutes } from './routes/gemini.routes';
import { supportRoutes } from './routes/support.routes';
import { trackRoutes } from './routes/track.routes';
import { env } from './config/env';

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
