import { Injectable, NotFoundException } from '@nestjs/common';
import { GameMatchesRepository } from './game-matches.repository';

@Injectable()
export class GameMatchesService {
  constructor(
    private readonly repo: GameMatchesRepository
  ) {}

  async getPlayableMatch(matchId: number) {
    const fixture = await this.repo.getFixture(BigInt(matchId));
    if (!fixture) {
      throw new NotFoundException('Fixture not found');
    }

    const gameConfig = await this.repo.getGameConfig(
      fixture.sport_alias.toLowerCase()
    );
    if (!gameConfig) {
      throw new Error('Game config missing');
    }

    const override = await this.repo.getFixtureOverride(
      BigInt(matchId)
    );

    const startMs =
      fixture.scheduled_start_time ??
      fixture.start_time;

    if (!startMs) {
      throw new Error('Fixture start time missing');
    }

    const lockOffset =
      override?.lock_offset_sec ??
      gameConfig.lock_offset_sec;

    const lockAt = new Date(
      Number(startMs) - lockOffset * 1000
    ).toISOString();

    // 🔽 FETCH TEAMS
    const [teamA, teamB] = await Promise.all([
      this.repo.getTeamByExternalId(
        fixture.participants0_id
      ),
      this.repo.getTeamByExternalId(
        fixture.participants1_id
      ),
    ]);

    const fallbackLogo = '/teams/unknown.png';

    return {
      fixture: {
        id: Number(fixture.id),
        game: fixture.sport_alias.toUpperCase(),
        competition: fixture.competition_name,
        startsAt: new Date(Number(startMs)).toISOString(),

        teamA: {
          id: String(fixture.participants0_id),
          name: fixture.participants0_name,
          logo:
            teamA?.image_url ??
            fallbackLogo,
        },

        teamB: {
          id: String(fixture.participants1_id),
          name: fixture.participants1_name,
          logo:
            teamB?.image_url ??
            fallbackLogo,
        },
      },

      config: {
        lockAt,
        basePoints:
          override?.base_points ??
          gameConfig.base_points,
        multiplier:
          override?.multiplier ??
          gameConfig.multiplier,
        maxMultiplier: gameConfig.max_multiplier,
        allowDraw: gameConfig.allow_draw,
      },
    };
  }
}
