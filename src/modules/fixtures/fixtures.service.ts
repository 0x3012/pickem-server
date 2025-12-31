import { Injectable, NotFoundException } from '@nestjs/common';
import { FixturesRepository } from './fixtures.repository';
import { FixturesQueryDto } from './dto/fixtures.query.dto';
import { UpdateFixtureDto } from './dto/fixtures.update.dto';

@Injectable()
export class FixturesService {
  constructor(private repo: FixturesRepository) {}

  async getFixtures(query: FixturesQueryDto) {
  const fixtures = await this.repo.findMany({
    sport_alias: query.sport_alias,

    competition_id: query.competition_id
      ? BigInt(query.competition_id)
      : undefined,

    status: query.status,

     participants0_name: {
      notIn: ['TBD', 'tbd', ''],
    },
    participants1_name: {
      notIn: ['TBD', 'tbd', ''],
    },
  });



    return fixtures.map(f => ({
      id: f.id.toString(),
      competition_id: f.competition_id.toString(),
      competition_name: f.competition_name,
      sport_alias: f.sport_alias,
      sport_name: f.sport_name,
      status: f.status,
      scheduled_start_time:
        f.scheduled_start_time?.toString() ?? null,
      start_time: f.start_time?.toString() ?? null,
      end_time: f.end_time?.toString() ?? null,
      participants0_id:
        f.participants0_id?.toString() ?? null,
      participants0_name: f.participants0_name,
      participants0_score: f.participants0_score,
      participants1_id:
        f.participants1_id?.toString() ?? null,
      participants1_name: f.participants1_name,
      participants1_score: f.participants1_score,
    }));
  }

  async updateFixture(payload: UpdateFixtureDto) {
    const externalId = BigInt(payload.external_id);

    const existing = await this.repo.findByExternalId(externalId);
    if (!existing) throw new NotFoundException('Fixture not found');

    const data: any = {};
    if (payload.status !== undefined) data.status = payload.status;
    if (payload.participants0_id !== undefined)
      data.participants0_id = payload.participants0_id
        ? BigInt(payload.participants0_id)
        : null;
    if (payload.participants1_id !== undefined)
      data.participants1_id = payload.participants1_id
        ? BigInt(payload.participants1_id)
        : null;
    if (payload.participants0_score !== undefined)
      data.participants0_score = payload.participants0_score;
    if (payload.participants1_score !== undefined)
      data.participants1_score = payload.participants1_score;
    if (payload.hs_description !== undefined)
      data.hs_description = payload.hs_description;
    if (payload.rr_description !== undefined)
      data.rr_description = payload.rr_description;
    if (payload.manual_override !== undefined)
      data.manual_override = payload.manual_override;

    const updated = await this.repo.updateByExternalId(externalId, data);

    // Serialize BigInt fields to strings to avoid JSON serialization errors
    return {
      id: updated.id.toString(),
      competition_id: updated.competition_id.toString(),
      competition_name: updated.competition_name,
      sport_alias: updated.sport_alias,
      sport_name: updated.sport_name,
      status: updated.status,
      scheduled_start_time: updated.scheduled_start_time?.toString() ?? null,
      start_time: updated.start_time?.toString() ?? null,
      end_time: updated.end_time?.toString() ?? null,
      participants0_id: updated.participants0_id?.toString() ?? null,
      participants0_name: updated.participants0_name,
      participants0_score: updated.participants0_score,
      participants1_id: updated.participants1_id?.toString() ?? null,
      participants1_name: updated.participants1_name,
      participants1_score: updated.participants1_score,
      hs_description: updated.hs_description,
      rr_description: updated.rr_description,
      manual_override: updated.manual_override,
      manual_updated_at: updated.manual_updated_at,
      ingested_at: updated.ingested_at,
    };
  }
}