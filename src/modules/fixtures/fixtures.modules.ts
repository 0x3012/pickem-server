import { Module } from '@nestjs/common';
import { FixturesController } from './fixtures.controller';
import { FixturesService } from './fixtures.service';
import { FixturesRepository } from './fixtures.repository';
import { FixturesSyncService } from './sync/fixtures.sync.service';
import { PointsModule } from '../points/points.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [FixturesController],
  imports: [PointsModule, NotificationsModule],
  providers: [
    FixturesService,
    FixturesRepository,
    FixturesSyncService,
    
  ],
})
export class FixturesModule { }
