import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MatchPicksService } from './match-picks.service';
import { CreateMatchPickDto } from './dto/create-match-pick.dto';

@Controller('v1/match-picks')
export class MatchPicksController {
  constructor(private service: MatchPicksService) {}

  @Post()
  create(@Body() dto: CreateMatchPickDto) {
    return this.service.createPick(dto);
  }

   @Get('user/:userId')
  getUserPicks(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.service.getUserPicks(userId, tenantId);
  }

   @Get('user/:userId/match/:matchId')
  getUserPickForMatch(
    @Param('userId') userId: string,
    @Param('matchId') matchId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.service.getUserPickForMatch(
      userId,
      matchId,
      tenantId,
    );
  }
}
