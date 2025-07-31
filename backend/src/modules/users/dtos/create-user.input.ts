import { UserRole } from "#common/users/enums.js";
import { IsArray, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, MinLength } from "class-validator";

export class CreateUserInput {
  @IsOptional()
  @IsString()
  address?: string;

  @IsDateString()
  @IsOptional()
  birthday?: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Length(1, 100)
  firstName!: string;

  @IsNotEmpty()
  @Length(1, 100)
  lastName!: string;

  @MinLength(8)
  password!: string;

  @IsPhoneNumber("NG")
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  referredByCode?: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  @IsOptional()
  roles?: UserRole[];
}
