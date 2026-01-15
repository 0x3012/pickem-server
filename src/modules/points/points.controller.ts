import { Controller, Post, Body } from '@nestjs/common';
import { PointsService } from './points.service';
import { CreditPointsDto} from './dto/credit-points.dto';
import { DebitPointsDto } from './dto/debit-points.dto';
import { GetBalanceDto } from './dto/get-balance.dto';

@Controller('v1/points')
export class PointsController {
  constructor(private service: PointsService) {}

  @Post('balance')
  getBalance(@Body() dto: GetBalanceDto) {
    return this.service.getBalance(dto.userId);
  }

  @Post('credit')
  credit(@Body() dto: CreditPointsDto) {
    return this.service.credit(dto);
  }

  @Post('debit')
  debit(@Body() dto: DebitPointsDto) {
    return this.service.debit(dto);
  }
}
