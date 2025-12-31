import { Injectable, NotFoundException } from '@nestjs/common';
import { CompetitionsRepository } from './competitions.repository';
import { CompetitionsQueryDto } from './dto/competitions.query.dto';

@Injectable()
export class CompetitionsService {
  constructor(private repo: CompetitionsRepository) {}

  async list(q: CompetitionsQueryDto) {
    const where: any = {};
    if (q.sport) where.sportAlias = q.sport;
    if (q.status) where.status = q.status.toLowerCase();

    const [items, total] = await Promise.all([
      this.repo.findMany(where, q.limit ?? 50, q.offset ?? 0),
      this.repo.count(where),
    ]);

    const serialized = items.map(i => ({
      id: i.id.toString(),
      external_id: i.external_id.toString(),
      sport_alias: i.sport_alias,
      name: i.name,
      status: i.status,
      start_date: i.start_date?.toString() ?? null,
      end_date: i.end_date?.toString() ?? null,
      prize_pool_usd: i.prize_pool_usd?.toString() ?? null,
      location: i.location,
      organizer: i.organizer,
      type: i.type,
      tier: i.tier,
      series: i.series,
      year: i.year,
      image_url: i.image_url,
      updated_at: i.updated_at,
      ingested_at: i.ingested_at,
    }));

    return { items: serialized, total, limit: q.limit ?? 50, offset: q.offset ?? 0 };
  }

  async getById(id: number) {
    const item = await this.repo.findById(BigInt(id));
    if (!item) throw new NotFoundException('Competition not found');
    return {
      id: item.id.toString(),
      external_id: item.external_id.toString(),
      sport_alias: item.sport_alias,
      name: item.name,
      status: item.status,
      start_date: item.start_date?.toString() ?? null,
      end_date: item.end_date?.toString() ?? null,
      prize_pool_usd: item.prize_pool_usd?.toString() ?? null,
      location: item.location,
      organizer: item.organizer,
      type: item.type,
      tier: item.tier,
      series: item.series,
      year: item.year,
      image_url: item.image_url,
      updated_at: item.updated_at,
      ingested_at: item.ingested_at,
    };
  }
}
