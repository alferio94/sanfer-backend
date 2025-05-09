import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEventGroupDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  color: string;
}
