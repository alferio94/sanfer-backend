import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class BulkUpdatePasswordsDto {
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;
}
