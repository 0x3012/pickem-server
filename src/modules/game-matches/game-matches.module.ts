import { Module } from '@nestjs/common';
import { GameMatchesController } from './game-matches.controller';
import { GameMatchesService } from './game-matches.service';
import { GameMatchesRepository } from './game-matches.repository';

@Module({
  controllers: [GameMatchesController],
  providers: [
    GameMatchesService,
    GameMatchesRepository
  ]
})
export class GameMatchesModule {}
