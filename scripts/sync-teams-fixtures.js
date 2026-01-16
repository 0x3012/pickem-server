const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const UPSTREAM_TEAMS_URL = process.env.UPSTREAM_TEAMS_URL || 'https://esport-data.com/api/teams';
const UPSTREAM_FIXTURES_URL = process.env.UPSTREAM_FIXTURES_URL || 'https://esport-data.com/db/fixtures';
const UPSTREAM_API_KEY = process.env.UPSTREAM_API_KEY || 'Qd3p!z8RW@u6L$t2Vx$G1n^Y7Bs*e5K%f9Mh&j4Sc0Zq!v2TwXo';

async function syncTeams() {
  console.log('\n🏅 Syncing Teams...');
  
  try {
    const sport = 'cs2';
    const url = `${UPSTREAM_TEAMS_URL}/${sport}`;
    
    console.log(`📡 Fetching from: ${url}`);
    
    const response = await axios.get(url, {
      headers: { 'x-api-key': UPSTREAM_API_KEY },
      params: { limit: -1 },
      timeout: 120000,
    });

    const teams = Array.isArray(response.data) 
      ? response.data 
      : Array.isArray(response.data?.data) 
        ? response.data.data 
        : null;

    if (!teams) {
      throw new Error('Invalid teams payload from upstream');
    }

    console.log(`📦 Received ${teams.length} teams`);

    // Obtener IDs existentes
    const externalIds = teams.map(t => BigInt(t.id));
    const existing = await prisma.team.findMany({
      where: { external_id: { in: externalIds } },
      select: { external_id: true },
    });
    const existingSet = new Set(existing.map(e => e.external_id.toString()));

    let synced = 0;
    let skipped = 0;

    for (const t of teams) {
      const externalId = BigInt(t.id);
      
      if (existingSet.has(externalId.toString())) {
        skipped++;
        continue;
      }

      await prisma.team.upsert({
        where: { external_id: externalId },
        create: {
          external_id: externalId,
          sport: sport,
          name: String(t.name ?? 'Unknown'),
          country: t.country ?? null,
          region: t.region ?? null,
          image_url: null,
          hs_description: t.hs_description ?? null,
          rr_description: t.rr_description ?? null,
          manual_override: t.manual_override ?? null,
          manual_updated_at: t.manual_updated_at ? new Date(t.manual_updated_at) : null,
          updated_at: t.updated_at ? new Date(t.updated_at) : null,
        },
        update: {
          sport: sport,
          name: String(t.name ?? 'Unknown'),
          country: t.country ?? null,
          region: t.region ?? null,
          hs_description: t.hs_description ?? null,
          rr_description: t.rr_description ?? null,
          manual_override: t.manual_override ?? null,
          manual_updated_at: t.manual_updated_at ? new Date(t.manual_updated_at) : null,
          updated_at: t.updated_at ? new Date(t.updated_at) : null,
        },
      });

      synced++;
    }

    console.log(`✅ Teams sync completed: ${synced} new, ${skipped} skipped`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing teams:', error.message);
    return false;
  }
}

async function updateFixtures() {
  console.log('\n🎮 Updating Recent Fixtures...');
  
  try {
    const sport = 'cs2';
    
    // Calcular rango: desde ayer hasta dentro de 1 mes
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fromDate = yesterday.toISOString().split('T')[0];

    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const toDate = oneMonthLater.toISOString().split('T')[0];

    console.log(`📅 Date range: ${fromDate} to ${toDate}`);
    console.log(`📡 Fetching from: ${UPSTREAM_FIXTURES_URL}`);
    
    const response = await axios.get(UPSTREAM_FIXTURES_URL, {
      headers: { 'x-api-key': UPSTREAM_API_KEY },
      params: { sport, from: fromDate, to: toDate, limit: -1 },
      timeout: 120000,
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid fixtures payload from upstream');
    }

    const fixtures = response.data;
    console.log(`📦 Received ${fixtures.length} fixtures`);

    let updated = 0;

    for (const f of fixtures) {
      await prisma.fixture.upsert({
        where: { id: BigInt(f.id) },
        create: {
          id: BigInt(f.id),
          competition_id: BigInt(f.competition_id),
          competition_name: f.competition_name ?? null,
          sport_alias: f.sport_alias,
          sport_name: f.sport_name ?? null,
          status: f.status ? String(f.status).trim().toLowerCase() : null,
          scheduled_start_time: f.scheduled_start_time != null ? BigInt(f.scheduled_start_time) : null,
          start_time: f.start_time != null ? BigInt(f.start_time) : null,
          end_time: f.end_time != null ? BigInt(f.end_time) : null,
          tie: f.tie ?? null,
          winner_id: f.winner_id != null ? BigInt(f.winner_id) : null,
          participants0_id: f.participants0_id != null ? BigInt(f.participants0_id) : null,
          participants0_name: f.participants0_name ?? null,
          participants0_score: f.participants0_score ?? null,
          participants1_id: f.participants1_id != null ? BigInt(f.participants1_id) : null,
          participants1_name: f.participants1_name ?? null,
          participants1_score: f.participants1_score ?? null,
          hs_description: f.hs_description ?? null,
          rr_description: f.rr_description ?? null,
          manual_override: f.manual_override ?? null,
          manual_updated_at: f.manual_updated_at ? new Date(f.manual_updated_at) : null,
        },
        update: {
          competition_id: BigInt(f.competition_id),
          competition_name: f.competition_name ?? null,
          sport_alias: f.sport_alias,
          sport_name: f.sport_name ?? null,
          status: f.status ? String(f.status).trim().toLowerCase() : null,
          scheduled_start_time: f.scheduled_start_time != null ? BigInt(f.scheduled_start_time) : null,
          start_time: f.start_time != null ? BigInt(f.start_time) : null,
          end_time: f.end_time != null ? BigInt(f.end_time) : null,
          tie: f.tie ?? null,
          winner_id: f.winner_id != null ? BigInt(f.winner_id) : null,
          participants0_id: f.participants0_id != null ? BigInt(f.participants0_id) : null,
          participants0_name: f.participants0_name ?? null,
          participants0_score: f.participants0_score ?? null,
          participants1_id: f.participants1_id != null ? BigInt(f.participants1_id) : null,
          participants1_name: f.participants1_name ?? null,
          participants1_score: f.participants1_score ?? null,
          hs_description: f.hs_description ?? null,
          rr_description: f.rr_description ?? null,
          manual_override: f.manual_override ?? null,
          manual_updated_at: f.manual_updated_at ? new Date(f.manual_updated_at) : null,
        },
      });

      updated++;

      if (updated % 50 === 0) {
        console.log(`⏳ ${updated}/${fixtures.length} fixtures processed`);
      }
    }

    console.log(`✅ Fixtures update completed: ${updated} fixtures updated`);
    return true;
  } catch (error) {
    console.error('❌ Error updating fixtures:', error.message);
    return false;
  }
}

async function main() {
  console.log('=================================');
  console.log('🔄 Starting Teams & Fixtures Sync');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('=================================');

  try {
    const teamsSuccess = await syncTeams();
    const fixturesSuccess = await updateFixtures();

    console.log('\n=================================');
    console.log('📋 Summary:');
    console.log(`Teams: ${teamsSuccess ? '✅' : '❌'}`);
    console.log(`Fixtures: ${fixturesSuccess ? '✅' : '❌'}`);
    console.log('=================================\n');

    await prisma.$disconnect();

    if (teamsSuccess && fixturesSuccess) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
