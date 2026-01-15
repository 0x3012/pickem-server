import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../config/env';
import { CompetitionsRepository } from '../competitions.repository';

const ALLOWED_SPORTS = ['cs2'];
const LOG_EVERY = 25;

@Injectable()
export class CompetitionsSyncService {
  private logger = new Logger(CompetitionsSyncService.name);

  constructor(private repo: CompetitionsRepository) {}

  async runOnce(sportAliases: string[] = ['cs2']) {
    if (!env.upstreamCompetitionsUrl) {
      throw new Error('UPSTREAM_COMPETITIONS_URL is not defined');
    }

    if (!env.upstreamApiKey) {
      throw new Error('UPSTREAM_API_KEY is not defined');
    }

    const validSports = sportAliases.filter(s =>
      ALLOWED_SPORTS.includes(s)
    );

    if (!validSports.length) {
      this.logger.warn('No valid sport provided, skipping sync');
      return { synced: 0 };
    }

    let totalSynced = 0;

    for (const sport of validSports) {
      const sportStart = Date.now();

      this.logger.log(`▶️ Starting sync for sport=${sport}`);

      const response = await axios.get(env.upstreamCompetitionsUrl, {
        headers: { 'x-api-key': env.upstreamApiKey },
        params: {
          sport, 
            start_date: 20250100,
            limit: 50000000,

        },
        timeout: 120_000,
      });

       const competitions = Array.isArray(response.data)
        ? response.data
        : null;

      if (!competitions) {
        this.logger.error({
          endpoint: env.upstreamCompetitionsUrl,
          payloadType: typeof response.data,
          payload: response.data,
        });
        throw new Error('Invalid upstream competitions payload');
      }

      this.logger.log(
        `📦 Received ${competitions.length} competitions for ${sport}`
      );

      let processed = 0;

      for (const c of competitions) {
        processed++;

        this.logger.debug(
          `Processing ${sport} ${processed}/${competitions.length} (id=${c.id})`
        );

        await this.repo.upsert({
         external_id: BigInt(c.id),


          sport_alias: c.sport_alias,
          name: c.name ?? 'Unknown',

          status: String(c.status ?? 'unknown')
            .trim()
            .toLowerCase(),

          start_date:
            c.start_date != null ? BigInt(c.start_date) : null,

          end_date:
            c.end_date != null ? BigInt(c.end_date) : null,

          prize_pool_usd:
            c.prize_pool_usd != null
              ? BigInt(c.prize_pool_usd)
              : null,

          location: c.location ?? null,
          organizer: c.organizer ?? null,
          type: c.type ?? null,

          tier: c.tier ?? null,
          series: c.series ?? null,
          year: c.year ?? null,

          image_url: c.image_url ?? null,

          updated_at:
            c.updated_at ? new Date(c.updated_at) : null,
        });

        if (processed % LOG_EVERY === 0) {
          const elapsed = ((Date.now() - sportStart) / 1000).toFixed(1);
          this.logger.log(
            `⏳ ${sport}: ${processed}/${competitions.length} processed (${elapsed}s)`
          );
        }
      }

      const sportElapsed = ((Date.now() - sportStart) / 1000).toFixed(1);
      totalSynced += competitions.length;

      this.logger.log(
        `✅ Finished ${sport}: ${competitions.length} competitions synced in ${sportElapsed}s`
      );
    }

    this.logger.log(
      `🏁 Sync complete. Total competitions synced: ${totalSynced}`
    );

    return { synced: totalSynced };
  }
}
