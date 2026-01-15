import {
  Controller,
  Get,
  Param,
  Query,
  Post,
} from '@nestjs/common';

import { CompetitionsService } from './competitions.service';
import { CompetitionsQueryDto } from './dto/competitions.query.dto';
import { CompetitionsSyncService } from './sync/competitions.sync.service';

@Controller('v1/competitions')
export class CompetitionsController {
  constructor(
    private readonly service: CompetitionsService,
    private readonly sync: CompetitionsSyncService,
  ) {}

  @Get()
  list(@Query() q: CompetitionsQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

   @Post('sync')
  async syncCompetitions() {
    return this.sync.runOnce(['cs2']);
  }
}
