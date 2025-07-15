import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAppMenuDto {
  @IsBoolean()
  @IsOptional()
  transporte?: boolean;

  @IsBoolean()
  @IsOptional()
  alimentos?: boolean;

  @IsBoolean()
  @IsOptional()
  codigoVestimenta?: boolean;

  @IsBoolean()
  @IsOptional()
  ponentes?: boolean;

  @IsBoolean()
  @IsOptional()
  encuestas?: boolean;

  @IsBoolean()
  @IsOptional()
  hotel?: boolean;

  @IsBoolean()
  @IsOptional()
  agenda?: boolean;

  @IsBoolean()
  @IsOptional()
  atencionMedica?: boolean;

  @IsBoolean()
  @IsOptional()
  sede?: boolean;
}