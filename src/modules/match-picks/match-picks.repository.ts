import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMatchPickDto } from './dto/create-match-pick.dto';

@Injectable()
export class MatchPicksRepository {
    constructor(private prisma: PrismaService) { }

    upsert(data: CreateMatchPickDto) {
        return this.prisma.matchPick.upsert({
            where: {
                user_id_fixture_id_tenant_id: {
                    user_id: BigInt(data.userId),
                    fixture_id: BigInt(data.matchId),
                    tenant_id: BigInt(data.tenantId),
                },
            },

            create: {
                tenant_id: BigInt(data.tenantId),

                user_id: BigInt(data.userId),
                user_email: data.userEmail,
                fixture_id: BigInt(data.matchId),
                picked_team_id: data.pickedTeamId
                    ? BigInt(data.pickedTeamId)
                    : null,
                user_lock_time: data.userLockTime
                    ? new Date(data.userLockTime)
                    : null,
            },

            update: {
                picked_team_id: data.pickedTeamId
                    ? BigInt(data.pickedTeamId)
                    : null,
                updated_at: new Date(),
            },
        });
    }

    findAllByUser(userId: string, tenantId: string) {
        return this.prisma.matchPick.findMany({
            where: {
                user_id: BigInt(userId),
                tenant_id: BigInt(tenantId),
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }

     findByUserAndMatch(
        userId: string,
        matchId: string,
        tenantId: string
    ) {
        return this.prisma.matchPick.findUnique({
            where: {
                 user_id_fixture_id_tenant_id: {
                    user_id: BigInt(userId),
                    fixture_id: BigInt(matchId),
                    tenant_id: BigInt(tenantId),
                },
            },
        });
    }
}
