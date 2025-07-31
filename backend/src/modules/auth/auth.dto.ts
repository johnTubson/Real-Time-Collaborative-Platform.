import { UserPublicProfileDto } from "#modules/users/dtos/user-public-profile.dto.js";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class AuthResponse {
  accessToken!: string;
  user!: UserPublicProfileDto;
}

export class LoginDto {
  @IsEmail({}, { message: "Invalid email format." })
  @IsNotEmpty({ message: "Email cannot be empty." })
  email!: string;

  @IsNotEmpty({ message: "Password cannot be empty." })
  @MinLength(8, { message: "Password must be at least 8 characters long." })
  password!: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: "Confirm password cannot be empty." })
  @MinLength(8, { message: "Confirm password must be at least 8 characters long." })
  confirmPassword!: string;

  @IsEmail({}, { message: "Invalid email format." })
  @IsNotEmpty({ message: "Email cannot be empty." })
  email!: string;

  @IsNotEmpty({ message: "First name cannot be empty." })
  firstName!: string;

  @IsNotEmpty({ message: "Last name cannot be empty." })
  lastName!: string;

  @IsNotEmpty({ message: "Password cannot be empty." })
  @MinLength(8, { message: "Password must be at least 8 characters long." })
  password!: string;
}
