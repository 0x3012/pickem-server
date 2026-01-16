const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const UPSTREAM_BASE_URL = process.env.UPSTREAM_BASE_URL || 'https://esport-data.com/db/competitions';
const UPSTREAM_API_KEY = process.env.UPSTREAM_API_KEY || 'Qd3p!z8RW@u6L$t2Vx$G1n^Y7Bs*e5K%f9Mh&j4Sc0Zq!v2TwXo';

async function syncCompetitions() {
  console.log('=================================');
  console.log('🏆 Starting Competitions Sync');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('=================================');

  try {
    const sport = 'cs2';
    
    console.log(`📡 Fetching from: ${UPSTREAM_BASE_URL}`);
    
    const response = await axios.get(UPSTREAM_BASE_URL, {
      headers: { 'x-api-key': UPSTREAM_API_KEY },
      params: {
        sport,
        start_date: 20250100,
        limit: 50000000,
      },
      timeout: 120000,
    });

    const competitions = Array.isArray(response.data) ? response.data : null;

    if (!competitions) {
      throw new Error('Invalid competitions payload from upstream');
    }

    console.log(`📦 Received ${competitions.length} competitions`);

    // Obtener IDs existentes
    const externalIds = competitions.map(c => BigInt(c.id));
    const existing = await prisma.competition.findMany({
      where: { external_id: { in: externalIds } },
      select: { external_id: true },
    });
    const existingSet = new Set(existing.map(e => e.external_id.toString()));

    let synced = 0;
    let skipped = 0;

    for (const c of competitions) {
      const externalId = BigInt(c.id);
      
      if (existingSet.has(externalId.toString())) {
        skipped++;
        continue;
      }

      await prisma.competition.upsert({
        where: { external_id: externalId },
        create: {
          external_id: externalId,
          sport_alias: c.sport_alias,
          name: c.name ?? 'Unknown',
          status: String(c.status ?? 'unknown').trim().toLowerCase(),
          start_date: c.start_date != null ? BigInt(c.start_date) : null,
          end_date: c.end_date != null ? BigInt(c.end_date) : null,
          prize_pool_usd: c.prize_pool_usd != null ? BigInt(c.prize_pool_usd) : null,
          location: c.location ?? null,
          organizer: c.organizer ?? null,
          type: c.type ?? null,
          tier: c.tier ?? null,
          series: c.series ?? null,
          year: c.year ?? null,
          image_url: c.image_url ?? null,
          updated_at: c.updated_at ? new Date(c.updated_at) : null,
        },
        update: {
          sport_alias: c.sport_alias,
          name: c.name ?? 'Unknown',
          status: String(c.status ?? 'unknown').trim().toLowerCase(),
          start_date: c.start_date != null ? BigInt(c.start_date) : null,
          end_date: c.end_date != null ? BigInt(c.end_date) : null,
          prize_pool_usd: c.prize_pool_usd != null ? BigInt(c.prize_pool_usd) : null,
          location: c.location ?? null,
          organizer: c.organizer ?? null,
          type: c.type ?? null,
          tier: c.tier ?? null,
          series: c.series ?? null,
          year: c.year ?? null,
          image_url: c.image_url ?? null,
          updated_at: c.updated_at ? new Date(c.updated_at) : null,
        },
      });

      synced++;

      if (synced % 25 === 0) {
        console.log(`⏳ ${synced} new competitions processed, ${skipped} skipped`);
      }
    }

    console.log(`✅ Competitions sync completed: ${synced} new, ${skipped} skipped`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing competitions:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

syncCompetitions();
