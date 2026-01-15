import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PointsRepository {
  constructor(private prisma: PrismaService) {}

  createTransaction(data: {
    tenantId: number;
    userId: number;
    externalTxId: string;
    type: 'credit' | 'debit';
    amount?: number;
    bonus?: number;
    coins?: number;
    source: string;
    metadata?: any;
  }) {
    return this.prisma.pointsTransaction.create({
      data: {
        tenant_id: BigInt(data.tenantId),
        user_id: BigInt(data.userId),
        external_tx_id: data.externalTxId,
        type: data.type,
        amount: data.amount,
        bonus: data.bonus,
        coins: data.coins,
        source: data.source,
        metadata: data.metadata,
      },
    });
  }
}
