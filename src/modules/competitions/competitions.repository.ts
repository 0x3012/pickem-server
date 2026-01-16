import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type UpsertCompetition = {
  external_id: bigint;
  sport_alias: string;
  name: string;
  status: string;

  start_date?: bigint | null;
  end_date?: bigint | null;

  prize_pool_usd?: bigint  | null;

  location?: string | null;
  organizer?: string | null;
  type?: string | null;

  tier?: string | null;
  series?: string | null;
  year?: string | null;

  image_url?: string | null;

  updated_at?: Date | null;
};

@Injectable()
export class CompetitionsRepository {
  constructor(private prisma: PrismaService) {}

  upsert(data: UpsertCompetition) {
    return this.prisma.competition.upsert({
      where: { external_id: data.external_id },
      create: data,
      update: data,
    });
  }

  findMany(where: any, limit: number, offset: number) {
    return this.prisma.competition.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { start_date: 'desc' },
    });
  }

  count(where: any) {
    return this.prisma.competition.count({ where });
  }

  findById(id: bigint) {
    return this.prisma.competition.findUnique({ where: { id } });
  }

  findByExternalIds(externalIds: bigint[]) {
    return this.prisma.competition.findMany({
      where: { external_id: { in: externalIds } },
      select: { external_id: true },
    });
  }
}
