import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginEventUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}