import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../config/env';
import { TeamsRepository } from '../teams.repository';
import { fetchAndCacheTeamLogo } from '../../../utils/image-cache.util';

const ALLOWED_SPORTS = ['cs2', 'dota2', 'lol'];
const LOG_EVERY = 100;

@Injectable()
export class TeamsSyncService {
  private logger = new Logger(TeamsSyncService.name);

  constructor(private repo: TeamsRepository) {}

  async syncNewOnly(sports: string[] = ['cs2']) {
    if (!env.upstreamTeamsUrl) {
      throw new Error('UPSTREAM_TEAMS_URL is not defined');
    }
    if (!env.upstreamApiKey) {
      throw new Error('UPSTREAM_API_KEY is not defined');
    }

    const validSports = sports
      .map(s => s.toLowerCase())
      .filter(s => ALLOWED_SPORTS.includes(s));

    if (!validSports.length) {
      this.logger.warn('No valid sport provided, skipping teams sync');
      return { synced: 0, skipped: 0 };
    }

    let totalUpserts = 0;
    let totalSkipped = 0;

    for (const sport of validSports) {
      const started = Date.now();
      const url = `${env.upstreamTeamsUrl}/${sport}`; 

      this.logger.log(`▶️ Teams NEW-ONLY sync started for sport=${sport} url=${url}`);

      const res = await axios.get(url, {
        headers: { 'x-api-key': env.upstreamApiKey },
        params:{'limit': -1},
        timeout: 120_000,
      });

      const payload = res.data;

      const teams = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : null;

      if (!teams) {
        this.logger.error({
          url,
          keys: payload ? Object.keys(payload) : null,
          sample: payload?.data?.[0] ?? payload,
        });
        throw new Error(
          'Invalid upstream teams payload: expected [] or { data: [] }',
        );
      }

      this.logger.log(`📦 Received ${teams.length} teams (raw) for sport=${sport}`);

      // Obtener IDs existentes en BD
      const externalIds = teams.map(t => BigInt(t.id));
      const existing = await this.repo.findByExternalIds(externalIds);
      const existingSet = new Set(existing.map(e => e.external_id.toString()));

      let processed = 0;
      let skipped = 0;

      for (const t of teams) {
        const externalId = BigInt(t.id);
        
        // Solo procesar si NO existe
        if (existingSet.has(externalId.toString())) {
          skipped++;
          continue;
        }

        processed++;

        let imageUrl: string | null = null;
        try {
          imageUrl = await fetchAndCacheTeamLogo(externalId);
        } catch {
          this.logger.warn(`⚠️ Logo fetch failed for team ${externalId.toString()}`);
        }

        await this.repo.upsert({
          external_id: externalId,
          sport: sport,
          name: String(t.name ?? 'Unknown'),
          country: t.country ?? null,
          region: t.region ?? null,
          image_url: imageUrl,
          hs_description: t.hs_description ?? null,
          rr_description: t.rr_description ?? null,
          manual_override: t.manual_override ?? null,
          manual_updated_at: t.manual_updated_at ? new Date(t.manual_updated_at) : null,
          updated_at: t.updated_at ? new Date(t.updated_at) : null,
        });

        if (processed % LOG_EVERY === 0) {
          const secs = ((Date.now() - started) / 1000).toFixed(1);
          this.logger.log(`⏳ ${sport}: ${processed} NEW processed, ${skipped} skipped (${secs}s)`);
        }
      }

      totalUpserts += processed;
      totalSkipped += skipped;

      const secs = ((Date.now() - started) / 1000).toFixed(1);
      this.logger.log(`✅ Teams sync finished sport=${sport}: ${processed} NEW upserts, ${skipped} skipped (${secs}s)`);
    }

    return { synced: totalUpserts, skipped: totalSkipped };
  }

  async runOnce(sports: string[] = ['cs2']) {
    if (!env.upstreamTeamsUrl) {
      throw new Error('UPSTREAM_TEAMS_URL is not defined');
    }
    if (!env.upstreamApiKey) {
      throw new Error('UPSTREAM_API_KEY is not defined');
    }

    const validSports = sports
      .map(s => s.toLowerCase())
      .filter(s => ALLOWED_SPORTS.includes(s));

    if (!validSports.length) {
      this.logger.warn('No valid sport provided, skipping teams sync');
      return { synced: 0 };
    }

    let totalUpserts = 0;

    for (const sport of validSports) {
      const started = Date.now();
      const url = `${env.upstreamTeamsUrl}/${sport}`; 

      this.logger.log(`▶️ Teams sync started for sport=${sport} url=${url}`);

      const res = await axios.get(url, {
        headers: { 'x-api-key': env.upstreamApiKey },
        params:{'limit': -1},
        timeout: 120_000,
      });

      const payload = res.data;

       const teams = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : null;

      if (!teams) {
        this.logger.error({
          url,
          keys: payload ? Object.keys(payload) : null,
          sample: payload?.data?.[0] ?? payload,
        });
        throw new Error(
          'Invalid upstream teams payload: expected [] or { data: [] }',
        );
      }

      this.logger.log(`📦 Received ${teams.length} teams (raw) for sport=${sport}`);

      let processed = 0;

      for (const t of teams) {
        processed++;

        const externalId = BigInt(t.id);

        let imageUrl: string | null = null;
        try {
          imageUrl = await fetchAndCacheTeamLogo(externalId);
        } catch {
          this.logger.warn(`⚠️ Logo fetch failed for team ${externalId.toString()}`);
        }

        await this.repo.upsert({
          external_id: externalId,

           sport: sport,
          name: String(t.name ?? 'Unknown'),

          country: t.country ?? null,
          region: t.region ?? null,

          image_url: imageUrl,

          hs_description: t.hs_description ?? null,
          rr_description: t.rr_description ?? null,

          manual_override: t.manual_override ?? null,
          manual_updated_at: t.manual_updated_at ? new Date(t.manual_updated_at) : null,

          updated_at: t.updated_at ? new Date(t.updated_at) : null,
        });

        if (processed % LOG_EVERY === 0) {
          const secs = ((Date.now() - started) / 1000).toFixed(1);
          this.logger.log(`⏳ ${sport}: ${processed} processed (${secs}s)`);
        }
      }

      totalUpserts += processed;

      const secs = ((Date.now() - started) / 1000).toFixed(1);
      this.logger.log(`✅ Teams sync finished sport=${sport}: ${processed} upserts (${secs}s)`);
    }

    return { synced: totalUpserts };
  }
}
