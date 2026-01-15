import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MatchPicksRepository } from './match-picks.repository';
import { CreateMatchPickDto } from './dto/create-match-pick.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MatchPicksService {
  constructor(
    private readonly repo: MatchPicksRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createPick(dto: CreateMatchPickDto) {
    const lockAt = await this.computeLockTime(dto.matchId);

     if (Date.now() >= lockAt.getTime()) {
      throw new ForbiddenException('Match is locked');
    }

    return this.repo.upsert(dto);
  }
 
  async getUserPicks(userId: string, tenantId: string) {
    return this.repo.findAllByUser(userId, tenantId);
  }

  async getUserPickForMatch(
    userId: string,
    matchId: string,
    tenantId: string,
  ) {
    return this.repo.findByUserAndMatch(userId, matchId, tenantId);
  }
  private async computeLockTime(matchId: string): Promise<Date> {
     const fixture = await this.prisma.fixture.findUnique({
      where: { id: BigInt(matchId) },
      select: {
        scheduled_start_time: true,
        sport_alias: true,
      },
    });

    if (!fixture?.scheduled_start_time) {
      throw new ForbiddenException('Fixture not schedulable');
    }

     const config = await this.prisma.gameConfig.findUnique({
      where: { sport_alias: fixture.sport_alias },
      select: {
        lock_offset_sec: true,
      },
    });

    const offsetSec = config?.lock_offset_sec ?? 60;

    return new Date(
      Number(fixture.scheduled_start_time) - offsetSec * 1000
    );
  }
}
