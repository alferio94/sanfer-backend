import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}