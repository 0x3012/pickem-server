import { IsOptional, IsString } from 'class-validator';

export class TeamsQueryDto {
  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
