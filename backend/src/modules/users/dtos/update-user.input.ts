import { IsDateString, IsOptional, IsString, Length } from "class-validator";

export class UpdateUserProfileInput {
  @IsOptional()
  @IsString()
  address?: string;

  @IsDateString()
  @IsOptional()
  birthday?: string;

  @IsOptional()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @Length(1, 100)
  lastName?: string;
}
