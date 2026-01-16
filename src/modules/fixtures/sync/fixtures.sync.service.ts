import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../config/env';
import { FixturesRepository } from '../fixtures.repository';

const ALLOWED_SPORTS = ['cs2'];
const LOG_EVERY = 50;

@Injectable()
export class FixturesSyncService {
  private logger = new Logger(FixturesSyncService.name);

  constructor(private repo: FixturesRepository) {}

  async syncNewOnly(sportAliases: string[] = ['cs2']) {
    if (!env.upstreamFixturesUrl) {
      throw new Error('UPSTREAM_FIXTURES_URL is not defined');
    }
    if (!env.upstreamApiKey) {
      throw new Error('UPSTREAM_API_KEY is not defined');
    }

    const validSports = sportAliases.filter(s =>
      ALLOWED_SPORTS.includes(s)
    );

    let totalSynced = 0;
    let totalSkipped = 0;

    for (const sport of validSports) {
      this.logger.log(`▶️ Syncing NEW-ONLY fixtures for ${sport}`);

      const today = new Date().toISOString().split('T')[0];

      const response = await axios.get(env.upstreamFixturesUrl, {
        headers: { 'x-api-key': env.upstreamApiKey },
        params: { sport, from: '2026-01-01', to: today, limit: -1 },
        timeout: 120_000,
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid upstream fixtures payload');
      }

      const fixtures = response.data;
      this.logger.log(`📦 ${fixtures.length} fixtures received`);

      // Obtener IDs existentes en BD
      const fixtureIds = fixtures.map(f => BigInt(f.id));
      const existing = await this.repo.findByIds(fixtureIds);
      const existingSet = new Set(existing.map(e => e.id.toString()));

      let processed = 0;
      let skipped = 0;

      for (const f of fixtures) {
        const fixtureId = BigInt(f.id);
        
        // Solo procesar si NO existe
        if (existingSet.has(fixtureId.toString())) {
          skipped++;
          continue;
        }

        processed++;

        await this.repo.upsert({
          id: fixtureId,
          competition_id: BigInt(f.competition_id),
          competition_name: f.competition_name ?? null,
          sport_alias: f.sport_alias,
          sport_name: f.sport_name ?? null,
          status: f.status
            ? String(f.status).trim().toLowerCase()
            : null,
          scheduled_start_time:
            f.scheduled_start_time != null
              ? BigInt(f.scheduled_start_time)
              : null,
          start_time:
            f.start_time != null ? BigInt(f.start_time) : null,
          end_time:
            f.end_time != null ? BigInt(f.end_time) : null,
          tie: f.tie ?? null,
          winner_id:
            f.winner_id != null ? BigInt(f.winner_id) : null,
          participants0_id:
            f.participants0_id != null
              ? BigInt(f.participants0_id)
              : null,
          participants0_name: f.participants0_name ?? null,
          participants0_score: f.participants0_score ?? null,
          participants1_id:
            f.participants1_id != null
              ? BigInt(f.participants1_id)
              : null,
          participants1_name: f.participants1_name ?? null,
          participants1_score: f.participants1_score ?? null,
          hs_description: f.hs_description ?? null,
          rr_description: f.rr_description ?? null,
          manual_override: f.manual_override ?? null,
          manual_updated_at: f.manual_updated_at
            ? new Date(f.manual_updated_at)
            : null,
        });

        if (processed % LOG_EVERY === 0) {
          this.logger.log(
            `⏳ ${processed} NEW fixtures processed, ${skipped} skipped`
          );
        }
      }

      totalSynced += processed;
      totalSkipped += skipped;
      this.logger.log(`✅ Finished ${sport}: ${processed} NEW, ${skipped} skipped`);
    }

    return { synced: totalSynced, skipped: totalSkipped };
  }

  async updateRecent(sportAliases: string[] = ['cs2']) {
    if (!env.upstreamFixturesUrl) {
      throw new Error('UPSTREAM_FIXTURES_URL is not defined');
    }
    if (!env.upstreamApiKey) {
      throw new Error('UPSTREAM_API_KEY is not defined');
    }

    const validSports = sportAliases.filter(s =>
      ALLOWED_SPORTS.includes(s)
    );

    let totalUpdated = 0;

    for (const sport of validSports) {
      this.logger.log(`▶️ Updating recent fixtures for ${sport}`);

      // Calcular rango: desde ayer hasta dentro de 1 mes
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const fromDate = yesterday.toISOString().split('T')[0];

      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const toDate = oneMonthLater.toISOString().split('T')[0];

      this.logger.log(`📅 Date range: ${fromDate} to ${toDate}`);

      const response = await axios.get(env.upstreamFixturesUrl, {
        headers: { 'x-api-key': env.upstreamApiKey },
        params: { sport, from: fromDate, to: toDate, limit: -1 },
        timeout: 120_000,
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid upstream fixtures payload');
      }

      const fixtures = response.data;
      this.logger.log(`📦 ${fixtures.length} fixtures received for update`);

      let processed = 0;

      for (const f of fixtures) {
        processed++;

        await this.repo.upsert({
          id: BigInt(f.id),
          competition_id: BigInt(f.competition_id),
          competition_name: f.competition_name ?? null,
          sport_alias: f.sport_alias,
          sport_name: f.sport_name ?? null,
          status: f.status
            ? String(f.status).trim().toLowerCase()
            : null,
          scheduled_start_time:
            f.scheduled_start_time != null
              ? BigInt(f.scheduled_start_time)
              : null,
          start_time:
            f.start_time != null ? BigInt(f.start_time) : null,
          end_time:
            f.end_time != null ? BigInt(f.end_time) : null,
          tie: f.tie ?? null,
          winner_id:
            f.winner_id != null ? BigInt(f.winner_id) : null,
          participants0_id:
            f.participants0_id != null
              ? BigInt(f.participants0_id)
              : null,
          participants0_name: f.participants0_name ?? null,
          participants0_score: f.participants0_score ?? null,
          participants1_id:
            f.participants1_id != null
              ? BigInt(f.participants1_id)
              : null,
          participants1_name: f.participants1_name ?? null,
          participants1_score: f.participants1_score ?? null,
          hs_description: f.hs_description ?? null,
          rr_description: f.rr_description ?? null,
          manual_override: f.manual_override ?? null,
          manual_updated_at: f.manual_updated_at
            ? new Date(f.manual_updated_at)
            : null,
        });

        if (processed % LOG_EVERY === 0) {
          this.logger.log(
            `⏳ ${processed}/${fixtures.length} fixtures updated`
          );
        }
      }

      totalUpdated += fixtures.length;
      this.logger.log(`✅ Finished ${sport}: ${fixtures.length} fixtures updated`);
    }

    return { updated: totalUpdated };
  }

  async runOnce(sportAliases: string[] = ['cs2']) {
    if (!env.upstreamFixturesUrl) {
      throw new Error('UPSTREAM_FIXTURES_URL is not defined');
    }
    if (!env.upstreamApiKey) {
      throw new Error('UPSTREAM_API_KEY is not defined');
    }

    const validSports = sportAliases.filter(s =>
      ALLOWED_SPORTS.includes(s)
    );

    let totalSynced = 0;

    for (const sport of validSports) {
      this.logger.log(`▶️ Syncing fixtures for ${sport}`);

      const today = new Date().toISOString().split('T')[0];

      const response = await axios.get(env.upstreamFixturesUrl, {
        headers: { 'x-api-key': env.upstreamApiKey },
        params: { sport, from: '2026-01-01', to: today, limit: -1 },
        timeout: 120_000,
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid upstream fixtures payload');
      }

      const fixtures = response.data;
      this.logger.log(`📦 ${fixtures.length} fixtures received`);

      let processed = 0;

      for (const f of fixtures) {
        processed++;

        await this.repo.upsert({
          id: BigInt(f.id),

          competition_id: BigInt(f.competition_id),
          competition_name: f.competition_name ?? null,

          sport_alias: f.sport_alias,
          sport_name: f.sport_name ?? null,

          status: f.status
            ? String(f.status).trim().toLowerCase()
            : null,

          scheduled_start_time:
            f.scheduled_start_time != null
              ? BigInt(f.scheduled_start_time)
              : null,

          start_time:
            f.start_time != null ? BigInt(f.start_time) : null,

          end_time:
            f.end_time != null ? BigInt(f.end_time) : null,

          tie: f.tie ?? null,

          winner_id:
            f.winner_id != null ? BigInt(f.winner_id) : null,

          participants0_id:
            f.participants0_id != null
              ? BigInt(f.participants0_id)
              : null,
          participants0_name: f.participants0_name ?? null,
          participants0_score: f.participants0_score ?? null,

          participants1_id:
            f.participants1_id != null
              ? BigInt(f.participants1_id)
              : null,
          participants1_name: f.participants1_name ?? null,
          participants1_score: f.participants1_score ?? null,

          hs_description: f.hs_description ?? null,
          rr_description: f.rr_description ?? null,

          manual_override: f.manual_override ?? null,
          manual_updated_at: f.manual_updated_at
            ? new Date(f.manual_updated_at)
            : null,
        });

        if (processed % LOG_EVERY === 0) {
          this.logger.log(
            `⏳ ${processed}/${fixtures.length} fixtures processed`
          );
        }
      }

      totalSynced += fixtures.length;
      this.logger.log(`✅ Finished ${sport}`);
    }

    return { synced: totalSynced };
  }
}
