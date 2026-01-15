import { Module } from '@nestjs/common';
import { MatchPicksController } from './match-picks.controller';
import { MatchPicksService } from './match-picks.service';
import { MatchPicksRepository } from './match-picks.repository';

@Module({
  controllers: [MatchPicksController],
  providers: [MatchPicksService, MatchPicksRepository],
})
export class MatchPicksModule {}
