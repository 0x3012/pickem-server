import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsSyncService } from './sync/teams.sync.service';
import { TeamsQueryDto } from './dto/teams.query.dto';
import { TeamsSyncDto } from './dto/teams.sync.dto';

@Controller('/v1/teams')
export class TeamsController {
  constructor(
    private teamsService: TeamsService,
    private syncService: TeamsSyncService,
  ) {}

  @Get()
  getTeams(@Query() query: TeamsQueryDto) {
    return this.teamsService.getTeams(query);
  }

  @Post('sync')
  sync(@Body() dto: TeamsSyncDto) {
    return this.syncService.runOnce(dto.sports ?? ['cs2']);
  }
}
