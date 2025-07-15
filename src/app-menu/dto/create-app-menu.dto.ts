import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateAppMenuDto {
  @IsUUID()
  eventId: string;

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