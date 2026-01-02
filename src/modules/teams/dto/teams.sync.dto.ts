import { IsArray, IsOptional, IsString } from 'class-validator';

export class TeamsSyncDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sports?: string[];
}
