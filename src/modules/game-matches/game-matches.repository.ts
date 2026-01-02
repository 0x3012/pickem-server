import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GameMatchesRepository {
  constructor(private prisma: PrismaService) {}

  getFixture(fixtureId: bigint) {
    return this.prisma.fixture.findUnique({
      where: { id: fixtureId },
    });
  }

  getGameConfig(sportAlias: string) {
    return this.prisma.gameConfig.findUnique({
      where: { sport_alias: sportAlias },
    });
  }

  getFixtureOverride(fixtureId: bigint) {
    return this.prisma.fixtureConfigOverride.findUnique({
      where: { fixture_id: fixtureId },
    });
  }
  
  getTeamByExternalId(externalId: bigint | null) {
  if (!externalId) return null;

  return this.prisma.team.findUnique({
    where: { external_id: externalId },
  });
}

}
