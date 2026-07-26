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
import { vmsLiaisonsRoutes } from './routes/vmsLiaisons.routes.js';
import { businessDocumentsRoutes } from './routes/businessDocuments.routes.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  // crossOriginOpenerPolicy disabled: Google Identity Services' sign-in flow uses a
  // popup + window.postMessage to hand the credential back to this origin, which
  // Helmet's default "same-origin" COOP header blocks.
  app.use(helmet({ crossOriginOpenerPolicy: false }));
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  // Ensures a DB connection before any route runs. No-ops instantly once connected —
  // needed here because on Vercel this file's default export is invoked directly per
  // request, with no separate startup step to connect first (unlike src/server.ts,
  // which connects once before listen()).
  app.use((req, res, next) => {
    connectDB().then(() => next(), next);
  });

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
  app.use('/api/vms-liaisons', vmsLiaisonsRoutes);
  app.use('/api/business-documents', businessDocumentsRoutes);

  app.use(errorHandler);

  return app;
}

// Default export: a ready-to-serve Express app instance. Vercel's zero-config Node.js
// builder picked this file up directly as the deployed function and requires the default
// export to be a callable server (an Express app satisfies that — it's just a request
// handler function under the hood). src/server.ts and src/serverless.ts use the named
// createApp() export instead, for their own bootstrap flows.
export default createApp();
