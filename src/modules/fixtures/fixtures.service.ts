import { Injectable } from '@nestjs/common';
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

  async updateFixture(dto: UpdateFixtureDto) {
    const externalId = BigInt(dto.external_id);
    
    const fixture = await this.repo.findByExternalId(externalId);
    
    if (!fixture) {
      throw new Error(`Fixture with external_id ${dto.external_id} not found`);
    }

    const updateData: any = {
      manual_override: 1,
    };

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.participants0_id !== undefined) {
      updateData.participants0_id = dto.participants0_id !== null 
        ? BigInt(dto.participants0_id) 
        : null;
    }

    if (dto.participants0_score !== undefined) {
      updateData.participants0_score = dto.participants0_score;
    }

    if (dto.participants1_id !== undefined) {
      updateData.participants1_id = dto.participants1_id !== null 
        ? BigInt(dto.participants1_id) 
        : null;
    }

    if (dto.participants1_score !== undefined) {
      updateData.participants1_score = dto.participants1_score;
    }

    if (dto.hs_description !== undefined) {
      updateData.hs_description = dto.hs_description;
    }

    if (dto.rr_description !== undefined) {
      updateData.rr_description = dto.rr_description;
    }

    if (dto.manual_override !== undefined) {
      updateData.manual_override = dto.manual_override;
    }

    const updated = await this.repo.updateByExternalId(externalId, updateData);

    return {
      id: updated.id.toString(),
      external_id: updated.id.toString(),
      status: updated.status,
      participants0_id: updated.participants0_id?.toString() ?? null,
      participants0_score: updated.participants0_score,
      participants1_id: updated.participants1_id?.toString() ?? null,
      participants1_score: updated.participants1_score,
      manual_override: updated.manual_override,
      manual_updated_at: updated.manual_updated_at,
    };
  }
}