import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { PointsRepository } from './points.repository';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [PointsController],
  providers: [
    PointsService,
    PointsRepository,
    PrismaService,
  ],
  exports: [
    PointsService, 
  ],
})
export class PointsModule {}
