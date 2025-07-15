import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshEventUserTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}