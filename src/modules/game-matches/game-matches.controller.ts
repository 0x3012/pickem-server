import { Controller, Get, Param } from '@nestjs/common';
import { GameMatchesService } from './game-matches.service';

@Controller('v1/game-matches')
export class GameMatchesController {
  constructor(
    private readonly service: GameMatchesService
  ) {}

  @Get(':id')
  getMatch(@Param('id') id: string) {
    return this.service.getPlayableMatch(Number(id));
  }
}
