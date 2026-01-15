import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { generateApiKey } from '../../utils/api-key';

@Injectable()
export class TenantsRepository {
    constructor(private prisma: PrismaService) { }

    create(dto: CreateTenantDto) {
        return this.prisma.tenant.create({
            data: {
                slug: dto.slug,
                name: dto.name,
                is_active: dto.isActive ?? true,
                apiKey: generateApiKey(),

            },
        });
    }

    findAll() {
        return this.prisma.tenant.findMany({
            where: { is_active: true },
            orderBy: { created_at: 'asc' },
        });
    }

    findById(id: string) {
        return this.prisma.tenant.findUnique({
            where: { id: BigInt(id) },
        });
    }

    findBySlug(slug: string) {
        return this.prisma.tenant.findUnique({
            where: { slug },
        });
    }

    update(id: string, dto: UpdateTenantDto) {
        return this.prisma.tenant.update({
            where: { id: BigInt(id) },
            data: {
                name: dto.name,
                is_active: dto.isActive,
                updated_at: new Date(),
            },
        });
    }

    findConfigByTenantId(tenantId: string) {
        return this.prisma.tenantConfig.findUnique({
            where: {
                tenant_id: BigInt(tenantId),
            },
        });
    }

    async findConfigByTenantSlug(slug: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
        });

        if (!tenant) return null;

        const config = await this.prisma.tenantConfig.findUnique({
            where: {
                tenant_id: tenant.id,
            },
        });

        return {
            tenant,
            config,
        };
    }
}
