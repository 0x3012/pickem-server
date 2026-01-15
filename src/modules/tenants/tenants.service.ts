import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private repo: TenantsRepository) {}

 
  create(dto: CreateTenantDto) {
    return this.repo.create(dto);
  }

  getAll() {
    return this.repo.findAll();
  }

  update(id: string, dto: UpdateTenantDto) {
    return this.repo.update(id, dto);
  }

  

  async getBySlug(slug: string) {
    const tenant = await this.repo.findBySlug(slug);
    return this.resolveTenantWithConfig(tenant);
  }

  async getById(id: string) {
    const tenant = await this.repo.findById(id);
    return this.resolveTenantWithConfig(tenant);
  }

 
  private async resolveTenantWithConfig(tenant: any) {
    if (!tenant || !tenant.is_active) {
      throw new NotFoundException('Tenant not found');
    }

    const config = await this.repo.findConfigByTenantId(
      tenant.id.toString()
    );

    return {
      tenant: {
        id: tenant.id.toString(),
        slug: tenant.slug,
        name: tenant.name,
        is_active: tenant.is_active,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
      },

      features: config?.features ?? {
        pickemEnabled: false,
        minigamesEnabled: false,
      },

      games: config?.games ?? {
        enabled: [],
        defaultGame: null,
      },

      theme: (config as any)?.theme ?? null,
    };
  }
}
