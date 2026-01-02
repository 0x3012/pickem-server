import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../config/env';
import { TeamsRepository } from '../teams.repository';
import { fetchAndCacheTeamLogo } from '../../../utils/image-cache.util';

const ALLOWED_SPORTS = ['cs2'];
const LOG_EVERY = 100;

@Injectable()
export class TeamsSyncService {
  private logger = new Logger(TeamsSyncService.name);

  constructor(private repo: TeamsRepository) {}

  async runOnce(sports: string[] = ['cs2']) {
    if (!env.upstreamTeamsUrl) {
      throw new Error('UPSTREAM_TEAMS_URL is not defined');
    }
    if (!env.upstreamApiKey) {
      throw new Error('UPSTREAM_API_KEY is not defined');
    }

    const validSports = sports.filter(s =>
      ALLOWED_SPORTS.includes(s.toLowerCase()),
    );

    if (!validSports.length) {
      this.logger.warn('No valid sport provided, skipping teams sync');
      return { synced: 0 };
    }

    let totalSynced = 0;

    for (const sport of validSports) {
      const started = Date.now();
      this.logger.log(`▶️ Teams sync started for sport=${sport}`);

      const res = await axios.get(env.upstreamTeamsUrl, {
        headers: { 'x-api-key': env.upstreamApiKey },
        timeout: 120_000,
      });

      const payload = res.data;
      const teams = Array.isArray(payload?.data) ? payload.data : null;

      if (!teams) {
        this.logger.error({
          keys: payload ? Object.keys(payload) : null,
          sample: payload?.data?.[0] ?? payload,
        });
        throw new Error('Invalid upstream teams payload: expected { count, data: [] }');
      }

      this.logger.log(`📦 Received ${teams.length} teams (raw)`);

      let processed = 0;

      for (const t of teams) {
        // Enforce sport at app level
        if (String(t.sport).toLowerCase() !== sport.toLowerCase()) {
          continue;
        }

        processed++;

        const externalId = BigInt(t.id);

        let imageUrl: string | null = null;
        try {
          imageUrl = await fetchAndCacheTeamLogo(externalId);
        } catch (err) {
          this.logger.warn(
            `⚠️ Logo fetch failed for team ${externalId.toString()}`,
          );
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
          manual_updated_at: t.manual_updated_at
            ? new Date(t.manual_updated_at)
            : null,

          updated_at: t.updated_at ? new Date(t.updated_at) : null,
        });

        if (processed % LOG_EVERY === 0) {
          const secs = ((Date.now() - started) / 1000).toFixed(1);
          this.logger.log(
            `⏳ ${sport}: ${processed} teams processed (${secs}s)`,
          );
        }
      }

      totalSynced += processed;
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      this.logger.log(
        `✅ Teams sync finished for ${sport}: ${processed} upserts in ${secs}s`,
      );
    }

    return { synced: totalSynced };
  }
}
