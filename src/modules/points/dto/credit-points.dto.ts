import {
  IsInt,
  IsString,
  IsOptional,
  IsIn,
  IsObject,
} from 'class-validator';

export class CreditPointsDto {
  @IsInt()
  tenantId: number;

  @IsInt()
  userId: number;

  @IsString()
  transactionId: string;

  @IsOptional()
  @IsInt()
  amount?: number;

  @IsOptional()
  @IsInt()
  bonus?: number;

  @IsOptional()
  @IsInt()
  coins?: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsIn(['pickem', 'minigame', 'admin'])
  source: 'pickem' | 'minigame' | 'admin';

  @IsOptional()
  @IsObject()
  metadata?: any;
}
