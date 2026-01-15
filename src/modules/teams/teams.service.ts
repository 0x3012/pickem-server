import { Injectable } from '@nestjs/common';
import { TeamsRepository } from './teams.repository';
import { TeamsQueryDto } from './dto/teams.query.dto';

@Injectable()
export class TeamsService {
  constructor(private repo: TeamsRepository) {}

  async getTeams(query: TeamsQueryDto) {
    const teams = await this.repo.findMany({
      ...(query.sport ? { sport: query.sport } : {}),
      ...(query.name
        ? { name: { contains: query.name } }
        : {}),
    });

    return teams.map(t => ({
      ...t,
      id: t.id.toString(),
    }));
  }
}
