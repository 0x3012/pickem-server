import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

export type UpsertFixture = {
  id: bigint;

  competition_id: bigint;
  competition_name?: string | null;

  sport_alias: string;
  sport_name?: string | null;

  status?: string | null;

  scheduled_start_time?: bigint | null;
  start_time?: bigint | null;
  end_time?: bigint | null;

  tie?: number | null;
  winner_id?: bigint | null;

  participants0_id?: bigint | null;
  participants0_name?: string | null;
  participants0_score?: number | null;

  participants1_id?: bigint | null;
  participants1_name?: string | null;
  participants1_score?: number | null;

  hs_description?: string | null;
  rr_description?: string | null;

  manual_override?: number | null;
  manual_updated_at?: Date | null;
};

@Injectable()
export class FixturesRepository {
  constructor(private prisma: PrismaService) { }

  upsert(data: UpsertFixture) {
    return this.prisma.fixture.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  findMany(where: Prisma.FixtureWhereInput) {
    return this.prisma.fixture.findMany({
      where,
      orderBy: {
        scheduled_start_time: 'asc',
      },
      select: {
        id: true,
        competition_id: true,
        competition_name: true,
        sport_alias: true,
        sport_name: true,
        status: true,
        scheduled_start_time: true,
        start_time: true,
        end_time: true,
        participants0_id: true,
        participants0_name: true,
        participants0_score: true,
        participants1_id: true,
        participants1_name: true,
        participants1_score: true,
      },
    });
  }

  async findByExternalId(externalId: bigint) {
    return this.prisma.fixture.findUnique({
      where: { id: externalId },
    });
  }

  async updateByExternalId(
    externalId: bigint,
    data: Partial<Omit<UpsertFixture, 'id'>>,
  ) {
    return this.prisma.fixture.update({
      where: { id: externalId },
      data: {
        ...data,
        manual_updated_at: new Date(),
      },
    });
  }

  findPicksForFixture(fixtureId: bigint) {
    return this.prisma.matchPick.findMany({
      where: { fixture_id: fixtureId },
    });
  }

  getGameConfig(tenantId: bigint, sportAlias: string) {
    return this.prisma.gameConfig.findFirst({
      where: {
        tenant_id: tenantId,
        sport_alias: sportAlias,
      },
    });
  }

  getFixtureOverride(fixtureId: bigint) {
    return this.prisma.fixtureConfigOverride.findFirst({
      where: { fixture_id: fixtureId },
    });
  }

async getTeamsByIds(teamIds: bigint[]) {
  return this.prisma.team.findMany({
    where: {
      id: { in: teamIds },
    },
    select: {
      id: true,
      name: true,
      image_url: true,
    },
  });
}

async getTeamsByExternalIds(externalIds: bigint[]) {
  if (!externalIds.length) return [];

  return this.prisma.team.findMany({
    where: {
      external_id: { in: externalIds },
    },
    select: {
      external_id: true,
      name: true,
      image_url: true,
    },
  });
}


}