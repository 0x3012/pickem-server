//src/app.module.ts

import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { FixturesModule } from './modules/fixtures/fixtures.modules';
@Module({
  imports: [DatabaseModule, CompetitionsModule, FixturesModule],
})
export class AppModule {}
