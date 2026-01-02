import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

export type UpsertTeam = {
  external_id: bigint;

  sport: string;
  name: string;

  country?: string | null;
  countryISO?: string | null;
  region?: string | null;

  image_url?: string | null;

  hs_description?: string | null;
  rr_description?: string | null;

  manual_override?: number | null;
  manual_updated_at?: Date | null;

  updated_at?: Date | null;
};

@Injectable()
export class TeamsRepository {
  constructor(private prisma: PrismaService) {}

  upsert(data: UpsertTeam) {
    return this.prisma.team.upsert({
      where: {
        external_id: data.external_id, // ✅ correct unique key
      },
      create: data, // ✅ id auto-generated
      update: data,
    });
  }

  findMany(where: Prisma.TeamWhereInput) {
    return this.prisma.team.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        external_id: true,
        sport: true,
        name: true,
        country: true,
        countryISO: true,
        region: true,
        image_url: true,
      },
    });
  }
}
