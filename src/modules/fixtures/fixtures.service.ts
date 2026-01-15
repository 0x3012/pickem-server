import { Injectable, NotFoundException } from '@nestjs/common';
import { FixturesRepository } from './fixtures.repository';
import { FixturesQueryDto } from './dto/fixtures.query.dto';
import { UpdateFixtureDto } from './dto/fixtures.update.dto';
import { PointsService } from '../points/points.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';


type ResolvedGameConfig = {
  lockOffsetSec: number;
  basePoints: number;
  multiplier: number;
  allowDraw: boolean;
};

@Injectable()
export class FixturesService {
  constructor(
    private readonly repo: FixturesRepository,
    private readonly pointsService: PointsService,
    private readonly notifications: NotificationsGateway,

  ) { }

 

  private async resolveConfig(
    tenantId: bigint,
    fixtureId: bigint,
    sportAlias: string,
  ): Promise<ResolvedGameConfig | null> {
    const override = await this.repo.getFixtureOverride(fixtureId);
    const base = await this.repo.getGameConfig(tenantId, sportAlias);

    if (!base) return null;

    return {
      lockOffsetSec:
        override?.lock_offset_sec ?? base.lock_offset_sec,

      basePoints:
        override?.base_points ?? base.base_points,

      multiplier: Number(
        override?.multiplier ?? base.multiplier ?? 1,
      ),

      allowDraw: base.allow_draw,
    };
  }

 

  async getFixtures(query: FixturesQueryDto) {
    const fixtures = await this.repo.findMany({
      sport_alias: query.sport_alias,
      competition_id: query.competition_id
        ? BigInt(query.competition_id)
        : undefined,
      status: query.status,
      participants0_name: { notIn: ['TBD', 'tbd', ''] },
      participants1_name: { notIn: ['TBD', 'tbd', ''] },
    });

    return fixtures.map(f => ({
      id: f.id.toString(),
      competition_id: f.competition_id.toString(),
      competition_name: f.competition_name,
      sport_alias: f.sport_alias,
      sport_name: f.sport_name,
      status: f.status,
      scheduled_start_time: f.scheduled_start_time?.toString() ?? null,
      start_time: f.start_time?.toString() ?? null,
      end_time: f.end_time?.toString() ?? null,
      participants0_id: f.participants0_id?.toString() ?? null,
      participants0_name: f.participants0_name,
      participants0_score: f.participants0_score,
      participants1_id: f.participants1_id?.toString() ?? null,
      participants1_name: f.participants1_name,
      participants1_score: f.participants1_score,
    }));
  }

 

  async updateFixture(payload: UpdateFixtureDto) {
    const externalId = BigInt(payload.external_id);

    const existing = await this.repo.findByExternalId(externalId);
    if (!existing) throw new NotFoundException('Fixture not found');
    const data: any = {};

    if (payload.status !== undefined)
      data.status = payload.status;

    if (payload.participants0_id !== undefined)
      data.participants0_id =
        payload.participants0_id !== null
          ? BigInt(payload.participants0_id)
          : null;

    if (payload.participants1_id !== undefined)
      data.participants1_id =
        payload.participants1_id !== null
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

    const updated = await this.repo.updateByExternalId(
      externalId,
      data,
    );

    if (existing.status !== 'ended' && updated.status === 'ended') {
      await this.settleFixture(updated);
    }

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
    };
  }


  private resolveWinner(fixture: any): bigint | null {
    if (
      fixture.participants0_score == null ||
      fixture.participants1_score == null
    ) return null;

    if (fixture.participants0_score > fixture.participants1_score)
      return fixture.participants0_id;

    if (fixture.participants1_score > fixture.participants0_score)
      return fixture.participants1_id;

    return null;
  }

  private async settleFixture(fixture: any) {
  const winnerId = this.resolveWinner(fixture);

  const picks = await this.repo.findPicksForFixture(fixture.id);
  if (!picks.length) return;

 
  const teamExternalIds = [
    fixture.participants0_id,
    fixture.participants1_id,
  ].filter((id): id is bigint => Boolean(id));

 
  const teams = await this.repo.getTeamsByExternalIds(teamExternalIds);

  const teamsMap = new Map<
    string,
    { id: string; name: string; logo: string | null }
  >(
    teams.map(t => [
      t.external_id.toString(),
      {
        id: t.external_id.toString(),
        name: t.name,
        logo: t.image_url,
      },
    ]),
  );

  const winnerTeam =
    winnerId && teamsMap.has(winnerId.toString())
      ? teamsMap.get(winnerId.toString())!
      : null;

  for (const pick of picks) {
    const config = await this.resolveConfig(
      pick.tenant_id,
      fixture.id,
      fixture.sport_alias,
    );

    if (!config) continue;

    const isCorrect =
      winnerId === null
        ? pick.picked_team_id === null && config.allowDraw
        : pick.picked_team_id?.toString() === winnerId.toString();

    if (!isCorrect) continue;

    const points = Math.floor(
      config.basePoints * config.multiplier,
    );

     await this.pointsService.credit({
      tenantId: Number(pick.tenant_id),
      userId: Number(pick.user_id),
      transactionId: `fixture:${fixture.id}:user:${pick.user_id}`,
      coins: points,
      amount: 0,
      bonus: 0,
      source: 'pickem',
      message: 'Pickem win',
      metadata: {
        fixtureId: fixture.id.toString(),
        winnerId: winnerId?.toString() ?? 'DRAW',
      },
    });

    
    const message = winnerTeam
      ? `You won ${points} points! Your pick on ${winnerTeam.name} won.`
      : `You won ${points} points!`;

     this.notifications.emit({
      tenantId: pick.tenant_id.toString(),
      userId: pick.user_id.toString(),
      type: 'PICK_WON',
      message,
      payload: {
        points,
        fixtureId: fixture.id.toString(),
        sport: fixture.sport_alias,
        team: winnerTeam,  
      },
    });
  }
}


}
