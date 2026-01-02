import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TeamsRepository } from './teams.repository';
import { TeamsSyncService } from './sync/teams.sync.service';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService, TeamsRepository, TeamsSyncService],
  exports: [TeamsService, TeamsRepository],
})
export class TeamsModule {}
