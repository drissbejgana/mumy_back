import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User.model';
import { Vehicle } from '../models/Vehicle.model';
import { Driver } from '../models/Driver.model';
import { TransportRequest } from '../models/TransportRequest.model';
import { Bid } from '../models/Bid.model';
import { EmptyReturn } from '../models/EmptyReturn.model';
import { FinancialRecord } from '../models/FinancialRecord.model';
import { TeamMember } from '../models/TeamMember.model';
import { ChatMessage } from '../models/ChatMessage.model';
import { SentimentAlert } from '../models/SentimentAlert.model';
import { AdBanner } from '../models/AdBanner.model';
import { Excursion } from '../models/Excursion.model';
import { TransporterWebsite } from '../models/TransporterWebsite.model';
import { ExcursionBooking } from '../models/ExcursionBooking.model';
import { ClientSupplier } from '../models/ClientSupplier.model';
import { SupportSession } from '../models/SupportSession.model';
import * as seedData from './seedData';

const idMap = new Map<string, string>();
const lookup = (oldId: string | null | undefined): string | undefined =>
  oldId ? idMap.get(oldId) : undefined;

async function clearAll() {
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    TransportRequest.deleteMany({}),
    Bid.deleteMany({}),
    EmptyReturn.deleteMany({}),
    FinancialRecord.deleteMany({}),
    TeamMember.deleteMany({}),
    ChatMessage.deleteMany({}),
    SentimentAlert.deleteMany({}),
    AdBanner.deleteMany({}),
    Excursion.deleteMany({}),
    TransporterWebsite.deleteMany({}),
    ExcursionBooking.deleteMany({}),
    ClientSupplier.deleteMany({}),
    SupportSession.deleteMany({}),
  ]);
}

async function seedUsers() {
  for (const u of seedData.USERS) {
    const { oldId, ...fields } = u;
    const passwordHash = await bcrypt.hash(seedData.DEMO_PASSWORDS[fields.role], 10);
    const doc = await User.create({ ...fields, email: fields.email.toLowerCase(), passwordHash });
    idMap.set(oldId, doc.id);
  }
}

async function seedDrivers() {
  for (const d of seedData.DRIVERS) {
    const { oldId, transporterOldId, linkedUserOldId, ...fields } = d;
    const doc = await Driver.create({
      ...fields,
      transporterId: lookup(transporterOldId),
      linkedUserId: lookup(linkedUserOldId ?? undefined) ?? null,
    });
    idMap.set(oldId, doc.id);
  }
}

async function seedVehicles() {
  for (const v of seedData.VEHICLES) {
    const { oldId, transporterOldId, ...fields } = v;
    const doc = await Vehicle.create({ ...fields, transporterId: lookup(transporterOldId) });
    idMap.set(oldId, doc.id);
  }
}

async function seedRequests() {
  for (const r of seedData.REQUESTS) {
    const { oldId, clientOldId, assignedDriverOldId, assignedVehicleOldId, transporterOldId, ...fields } = r;
    const doc = await TransportRequest.create({
      ...fields,
      clientId: lookup(clientOldId),
      assignedDriverId: lookup(assignedDriverOldId ?? undefined) ?? null,
      assignedVehicleId: lookup(assignedVehicleOldId ?? undefined) ?? null,
      transporterId: lookup(transporterOldId ?? undefined) ?? null,
    });
    idMap.set(oldId, doc.id);
  }
}

async function seedBids() {
  for (const b of seedData.BIDS) {
    const { oldId, requestOldId, transporterOldId, ...fields } = b;
    const doc = await Bid.create({ ...fields, requestId: lookup(requestOldId), transporterId: lookup(transporterOldId) });
    idMap.set(oldId, doc.id);
  }
}

async function seedEmptyReturns() {
  for (const e of seedData.EMPTY_RETURNS) {
    const { oldId, transporterOldId, ...fields } = e;
    const doc = await EmptyReturn.create({ ...fields, transporterId: lookup(transporterOldId) });
    idMap.set(oldId, doc.id);
  }
}

async function seedFinances() {
  for (const f of seedData.FINANCES) {
    const { transporterOldId, ...fields } = f;
    await FinancialRecord.create({ ...fields, transporterId: lookup(transporterOldId) });
  }
}

async function seedTeam() {
  for (const t of seedData.TEAM) {
    const { transporterOldId, ...fields } = t;
    await TeamMember.create({ ...fields, transporterId: lookup(transporterOldId ?? undefined) ?? null });
  }
}

async function seedCollabChats() {
  for (const c of seedData.COLLAB_CHATS) {
    const { senderOldId, ...fields } = c;
    await ChatMessage.create({ ...fields, threadId: 'public', senderId: lookup(senderOldId) });
  }
}

async function seedSentimentAlerts() {
  for (const s of seedData.SENTIMENT_ALERTS) {
    await SentimentAlert.create(s);
  }
}

async function seedBanners() {
  for (const b of seedData.BANNERS) {
    await AdBanner.create(b);
  }
}

async function seedExcursions() {
  for (const e of seedData.EXCURSIONS) {
    const { oldId, transporterOldId, ...fields } = e;
    const doc = await Excursion.create({ ...fields, transporterId: lookup(transporterOldId) });
    idMap.set(oldId, doc.id);
  }
}

async function seedWebsites() {
  for (const w of seedData.WEBSITES) {
    const { transporterOldId, ...fields } = w;
    await TransporterWebsite.create({ ...fields, transporterId: lookup(transporterOldId) });
  }
}

async function seedSupportSessions() {
  for (const s of seedData.SUPPORT_SESSIONS) {
    const { userOldId, messages, ...fields } = s;
    await SupportSession.create({
      ...fields,
      userId: lookup(userOldId),
      messages: messages.map((m) => ({
        ...m,
        senderId: lookup(m.senderOldId ?? undefined) ?? 'gemini',
      })),
    });
  }
}

function printCredentials() {
  const rows = seedData.USERS.map((u) => ({
    role: u.role,
    email: u.email,
    password: seedData.DEMO_PASSWORDS[u.role],
  }));
  console.log('\n=== Mumy Demo Login Credentials ===');
  console.table(rows);
  console.log('====================================\n');
}

async function main() {
  await connectDB();
  console.log('[Seed] clearing existing collections...');
  await clearAll();

  console.log('[Seed] inserting users...');
  await seedUsers();
  console.log('[Seed] inserting drivers...');
  await seedDrivers();
  console.log('[Seed] inserting vehicles...');
  await seedVehicles();
  console.log('[Seed] inserting transport requests...');
  await seedRequests();
  console.log('[Seed] inserting bids...');
  await seedBids();
  console.log('[Seed] inserting empty returns...');
  await seedEmptyReturns();
  console.log('[Seed] inserting financial records...');
  await seedFinances();
  console.log('[Seed] inserting team members...');
  await seedTeam();
  console.log('[Seed] inserting collaborative chat messages...');
  await seedCollabChats();
  console.log('[Seed] inserting sentiment alerts...');
  await seedSentimentAlerts();
  console.log('[Seed] inserting ad banners...');
  await seedBanners();
  console.log('[Seed] inserting excursions...');
  await seedExcursions();
  console.log('[Seed] inserting transporter websites...');
  await seedWebsites();
  console.log('[Seed] inserting support sessions...');
  await seedSupportSessions();

  printCredentials();

  await mongoose.disconnect();
  console.log('[Seed] done.');
}

main().catch((err) => {
  console.error('[Seed] failed:', err);
  process.exit(1);
});
