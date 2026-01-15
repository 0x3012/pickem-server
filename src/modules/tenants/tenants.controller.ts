import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('v1/tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

 
  @Get()
  getAll() {
    return this.service.getAll();
  }

 
  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }
 
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

 
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.service.update(id, dto);
  }
}
