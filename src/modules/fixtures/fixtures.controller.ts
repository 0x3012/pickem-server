import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { FixturesSyncService } from './sync/fixtures.sync.service';
import { FixturesQueryDto } from './dto/fixtures.query.dto';
import { FixturesSyncDto } from './dto/fixtures.sync.dto';
import { UpdateFixtureDto } from './dto/fixtures.update.dto';

@Controller('v1/fixtures')
export class FixturesController {
  constructor(
    private readonly fixturesService: FixturesService,
    private readonly fixturesSyncService: FixturesSyncService,
  ) {}

  @Get()
  getFixtures(@Query() query: FixturesQueryDto) {
    return this.fixturesService.getFixtures(query);
  }

  @Post('sync')
  syncFixtures(@Query() query: FixturesSyncDto) {
    return this.fixturesSyncService.runOnce(
      query.sports ?? ['cs2']
    );
  }

  @Post('sync-new')
  syncNewFixtures(@Query() query: FixturesSyncDto) {
    return this.fixturesSyncService.syncNewOnly(
      query.sports ?? ['cs2']
    );
  }

  @Post('update-recent')
  updateRecentFixtures(@Query() query: FixturesSyncDto) {
    return this.fixturesSyncService.updateRecent(
      query.sports ?? ['cs2']
    );
  }

  @Post('update')
  updateFixture(@Body() payload: UpdateFixtureDto) {
    console.log('[FixturesController] Received update payload:', payload);
    return this.fixturesService.updateFixture(payload);
  }
}
