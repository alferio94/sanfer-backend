import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  campus?: string;

  @IsString()
  @IsOptional()
  campusPhone?: string;

  @IsString()
  @IsOptional()
  campusMap?: string;

  @IsString()
  @IsOptional()
  dressCode?: string;

  @IsDate()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  startDate?: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  endDate?: Date;

  @IsString()
  @IsOptional()
  tips?: string;

  @IsString()
  @IsOptional()
  extra?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsString()
  @IsOptional()
  campusImage?: string;

  @IsString()
  @IsOptional()
  dressCodeImage?: string;
}
