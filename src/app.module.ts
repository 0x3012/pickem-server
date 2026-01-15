import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { ApiKeyGuard } from './auth/api-key.guard';

import { CompetitionsModule } from './modules/competitions/competitions.module';
import { FixturesModule } from './modules/fixtures/fixtures.modules';
import { GameMatchesModule } from './modules/game-matches/game-matches.module';
import { MatchPicksModule } from './modules/match-picks/match-picks.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { PointsModule } from './modules/points/points.module';
import { TeamsModule } from './modules/teams/teams.modules';

@Module({
  imports: [
    DatabaseModule,
    CompetitionsModule,
    FixturesModule,
    GameMatchesModule,
    MatchPicksModule,
    TenantsModule,
    PointsModule,
    TeamsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
