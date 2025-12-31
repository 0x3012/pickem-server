import { IsDefined, IsOptional, IsNumber, IsString, IsInt } from 'class-validator';

export class UpdateFixtureDto {
  // Identificador del fixture (required)
  @IsDefined()
  @IsNumber()
  external_id: number;

  // Status del fixture (fixture_started, fixture_ended, etc)
  @IsOptional()
  @IsString()
  status?: string;

  // Datos de equipo 1
  @IsOptional()
  @IsInt()
  participants0_id?: number | null;

  @IsOptional()
  @IsInt()
  participants0_score?: number | null;

  // Datos de equipo 2
  @IsOptional()
  @IsInt()
  participants1_id?: number | null;

  @IsOptional()
  @IsInt()
  participants1_score?: number | null;

  // Campos opcionales adicionales
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
