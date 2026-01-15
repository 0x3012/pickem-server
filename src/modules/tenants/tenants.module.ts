import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantsRepository } from './tenants.repository';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TenantsController],
  providers: [
    TenantsService,
    TenantsRepository,
    PrismaService,
  ],
  exports: [TenantsService],
})
export class TenantsModule {}
