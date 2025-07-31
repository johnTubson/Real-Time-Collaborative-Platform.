import { UserPublicProfileDto } from "#modules/users/dtos/user-public-profile.dto.js";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

import { AuthService } from "../auth.service.js";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: "email",
    });
  }

  async validate(email: string, pass: string): Promise<UserPublicProfileDto> {
    if (!email || !pass) {
      throw new BadRequestException("Email and password are required.");
    }
    const user = await this.authService.validateUserByPassword(email, pass);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    return user;
  }
}
