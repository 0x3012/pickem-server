import {
  IsEmail,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsISO8601,
  ValidateIf
} from 'class-validator';

export class CreateMatchPickDto {

 
  @IsString()
  @IsNotEmpty()
  tenantId: string;


  @IsString()
  @IsNotEmpty()
  userId: string;  

  @IsEmail()
  userEmail: string;

 

  @IsString()
  @IsNotEmpty()
  matchId: string;  

  @ValidateIf(o => o.pickedTeamId !== null)
  @IsString()
  pickedTeamId: string | null;

 

  @IsOptional()
  @IsISO8601()
  userLockTime?: string;  
}
