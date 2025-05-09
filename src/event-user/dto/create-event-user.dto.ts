import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateEventUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  groups?: string[];
}
