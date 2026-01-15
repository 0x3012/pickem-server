import { IsInt } from 'class-validator';

export class GetBalanceDto {
  @IsInt()
  userId: number;
}
