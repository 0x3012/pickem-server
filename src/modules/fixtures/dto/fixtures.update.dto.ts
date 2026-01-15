import { IsDefined, IsOptional, IsNumber, IsString, IsInt } from 'class-validator';

export class UpdateFixtureDto {
   @IsDefined()
  @IsNumber()
  external_id: number;

   @IsOptional()
  @IsString()
  status?: string;

   @IsOptional()
  @IsInt()
  participants0_id?: number | null;

  @IsOptional()
  @IsInt()
  participants0_score?: number | null;

   @IsOptional()
  @IsInt()
  participants1_id?: number | null;

  @IsOptional()
  @IsInt()
  participants1_score?: number | null;

   @IsOptional()
  @IsString()
  hs_description?: string | null;

  @IsOptional()
  @IsString()
  rr_description?: string | null;

  @IsOptional()
  @IsInt()
  manual_override?: number | null;
}
