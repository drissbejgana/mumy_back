// Removes the demo fixtures planted by `npm run seed` from a live database, leaving real
// signups and their data untouched.
//
//   npm run seed:purge            → dry run, prints what would be deleted
//   npm run seed:purge -- --confirm   → actually deletes
//   npm run seed:purge -- --all --confirm   → wipes every collection instead
//
// Seeded records carry no marker, so they are identified by the identities the fixtures
// use: the five demo accounts (matched by email) plus everything owned by them, and, for
// the two ownerless collections, the fixtures' exact titles/messages.

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Vehicle } from '../models/Vehicle.model.js';
import { Driver } from '../models/Driver.model.js';
import { TransportRequest } from '../models/TransportRequest.model.js';
import { Bid } from '../models/Bid.model.js';
import { EmptyReturn } from '../models/EmptyReturn.model.js';
import { FinancialRecord } from '../models/FinancialRecord.model.js';
import { TeamMember } from '../models/TeamMember.model.js';
import { ChatMessage } from '../models/ChatMessage.model.js';
import { SentimentAlert } from '../models/SentimentAlert.model.js';
import { AdBanner } from '../models/AdBanner.model.js';
import { Excursion } from '../models/Excursion.model.js';
import { TransporterWebsite } from '../models/TransporterWebsite.model.js';
import { ExcursionBooking } from '../models/ExcursionBooking.model.js';
import { ClientSupplier } from '../models/ClientSupplier.model.js';
import { SupportSession } from '../models/SupportSession.model.js';
import { VmsLiaison } from '../models/VmsLiaison.model.js';
import { BusinessDocument } from '../models/BusinessDocument.model.js';
import * as seedData from './seedData.js';

const confirm = process.argv.includes('--confirm');
const wipeEverything = process.argv.includes('--all');

const ALL_MODELS = [
  ['utilisateurs', User],
  ['véhicules', Vehicle],
  ['chauffeurs', Driver],
  ['demandes de transport', TransportRequest],
  ['offres', Bid],
  ['retours à vide', EmptyReturn],
  ['écritures financières', FinancialRecord],
  ["membres d'équipe", TeamMember],
  ['messages de collaboration', ChatMessage],
  ['alertes de sentiment', SentimentAlert],
  ['bannières publicitaires', AdBanner],
  ['excursions', Excursion],
  ['sites vitrines', TransporterWebsite],
  ["réservations d'excursion", ExcursionBooking],
  ['clients & fournisseurs', ClientSupplier],
  ['sessions de support', SupportSession],
  ['liaisons VMS', VmsLiaison],
  ['documents commerciaux', BusinessDocument],
] as const;

type Plan = Array<{ label: string; model: any; filter: Record<string, unknown> }>;

async function buildTargetedPlan(): Promise<Plan> {
  const seedEmails = seedData.USERS.map((u) => u.email.toLowerCase());
  const seedUsers = await User.find({ email: { $in: seedEmails } }).select('_id');
  const userIds = seedUsers.map((u) => u._id);

  if (userIds.length === 0) {
    console.log('[Purge] Aucun compte de démonstration trouvé — la base ne contient pas de données de seed.');
  }

  // Requests reachable from the demo accounts, so bids on them go too even if the bidder
  // is a real transporter who happened to quote on a demo mission.
  const seedRequests = await TransportRequest.find({
    $or: [{ clientId: { $in: userIds } }, { transporterId: { $in: userIds } }],
  }).select('_id');
  const requestIds = seedRequests.map((r) => r._id);

  const ownedByDemo = { transporterId: { $in: userIds } };

  return [
    { label: 'offres', model: Bid, filter: { $or: [{ transporterId: { $in: userIds } }, { requestId: { $in: requestIds } }] } },
    { label: 'demandes de transport', model: TransportRequest, filter: { _id: { $in: requestIds } } },
    { label: 'véhicules', model: Vehicle, filter: ownedByDemo },
    { label: 'chauffeurs', model: Driver, filter: ownedByDemo },
    { label: 'retours à vide', model: EmptyReturn, filter: ownedByDemo },
    { label: 'écritures financières', model: FinancialRecord, filter: ownedByDemo },
    { label: 'excursions', model: Excursion, filter: ownedByDemo },
    { label: "réservations d'excursion", model: ExcursionBooking, filter: ownedByDemo },
    { label: 'sites vitrines', model: TransporterWebsite, filter: ownedByDemo },
    { label: 'clients & fournisseurs', model: ClientSupplier, filter: ownedByDemo },
    { label: 'liaisons VMS', model: VmsLiaison, filter: ownedByDemo },
    { label: 'documents commerciaux', model: BusinessDocument, filter: ownedByDemo },
    // Platform staff seeded with transporterId: null are matched on their fixture emails.
    {
      label: "membres d'équipe",
      model: TeamMember,
      filter: {
        $or: [
          ownedByDemo,
          { email: { $in: seedData.TEAM.map((t) => t.email) } },
        ],
      },
    },
    { label: 'messages de collaboration', model: ChatMessage, filter: { senderId: { $in: userIds } } },
    { label: 'sessions de support', model: SupportSession, filter: { userId: { $in: userIds } } },
    // Ownerless collections: matched on the fixtures' own text.
    { label: 'bannières publicitaires', model: AdBanner, filter: { title: { $in: seedData.BANNERS.map((b) => b.title) } } },
    { label: 'alertes de sentiment', model: SentimentAlert, filter: { message: { $in: seedData.SENTIMENT_ALERTS.map((a) => a.message) } } },
    // Deleted last: everything above is located through these accounts.
    { label: 'utilisateurs', model: User, filter: { _id: { $in: userIds } } },
  ];
}

function buildFullWipePlan(): Plan {
  return ALL_MODELS.map(([label, model]) => ({ label, model, filter: {} }));
}

async function main() {
  await connectDB();

  const plan = wipeEverything ? buildFullWipePlan() : await buildTargetedPlan();

  console.log(
    wipeEverything
      ? '\n[Purge] MODE --all : TOUTES les collections seront vidées, y compris les comptes réels.\n'
      : '\n[Purge] Suppression ciblée des données de démonstration (les comptes réels sont conservés).\n'
  );

  let total = 0;
  for (const step of plan) {
    const count = await step.model.countDocuments(step.filter);
    total += count;
    if (count === 0) continue;

    if (confirm) {
      await step.model.deleteMany(step.filter);
      console.log(`  supprimé   ${String(count).padStart(5)}  ${step.label}`);
    } else {
      console.log(`  à supprimer ${String(count).padStart(4)}  ${step.label}`);
    }
  }

  if (total === 0) {
    console.log('  (rien à supprimer)');
  } else if (confirm) {
    console.log(`\n[Purge] ${total} document(s) supprimé(s).`);
  } else {
    console.log(
      `\n[Purge] ${total} document(s) seraient supprimés. Relancez avec --confirm pour exécuter :\n` +
        `        npm run seed:purge -- --confirm${wipeEverything ? ' --all' : ''}\n`
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[Purge] échec :', err);
  process.exit(1);
});
