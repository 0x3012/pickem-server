import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PointsRepository } from './points.repository';
import { CreditPointsDto} from './dto/credit-points.dto';
import { DebitPointsDto } from './dto/debit-points.dto';
import { GetBalanceDto } from './dto/get-balance.dto';

@Injectable()
export class PointsService {
  constructor(
    private readonly http: HttpService,
    private readonly repo: PointsRepository,
  ) {}

  async getBalance(userId: number) {
    const res = await firstValueFrom(
      this.http.post(
        `${process.env.WP_API_URL}/gamification/v1/get_balance`,
        { user_id: userId },
        { headers: this.wpHeaders() },
      ),
    );

    return res.data;
  }

  async credit(dto: CreditPointsDto) {
    const res = await firstValueFrom(
      this.http.post(
        `${process.env.WP_API_URL}/gamification/v1/credit_balance`,
        this.mapWpPayload(dto),
        { headers: this.wpHeaders(dto) },
      ),
    );

    await this.repo.createTransaction({
      tenantId: dto.tenantId,
      userId: dto.userId,
      externalTxId: dto.transactionId,
      type: 'credit',
      amount: dto.amount,
      bonus: dto.bonus,
      coins: dto.coins,
      source: dto.source,
      metadata: dto.metadata,
    });

    return res.data;
  }

  async debit(dto: DebitPointsDto) {
    const res = await firstValueFrom(
      this.http.post(
        `${process.env.WP_API_URL}/gamification/v1/debit_balance`,
        this.mapWpPayload(dto),
        { headers: this.wpHeaders(dto) },
      ),
    );

    await this.repo.createTransaction({
      tenantId: dto.tenantId,
      userId: dto.userId,
      externalTxId: dto.transactionId,
      type: 'debit',
      amount: dto.amount,
      bonus: dto.bonus,
      coins: dto.coins,
      source: dto.source,
      metadata: dto.metadata,
    });

    return res.data;
  }

  private wpHeaders(dto?: CreditPointsDto) {
    return {
      ClientKey: process.env.WPEM_CLIENT_KEY,
      Token: process.env.WPEM_CLIENT_SECRET,
    };
  }

  private mapWpPayload(dto: CreditPointsDto) {
    return {
      user_id: dto.userId,
      transaction_id: dto.transactionId,
      amount: dto.amount ?? 0,
      bonus: dto.bonus ?? 0,
      coins: dto.coins ?? 0,
      message: dto.message,
      data: dto.metadata,
      data_hash: this.hash(dto),
    };
  }

  private hash(dto: CreditPointsDto) {
    const raw = `${process.env.WPEM_CLIENT_SECRET}_${dto.userId}_${dto.transactionId}_${dto.amount ?? 0}_${dto.bonus ?? 0}_${dto.coins ?? 0}`;
    return require('crypto').createHash('md5').update(raw).digest('hex');
  }
}
