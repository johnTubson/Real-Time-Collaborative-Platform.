import { OtpType, UserRole } from "#common/users/enums.js";
import { ConfigService } from "#config/config.service.js";
import { UserPublicProfileDto } from "#modules/users/dtos/user-public-profile.dto.js";
import { UsersService } from "#modules/users/services/user.service.js";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface JwtPayload {
  email: string;
  roles: UserRole[];
  sub: string;
}

export interface OtpVerificationPayload {
  purpose: "otp-verification"; // Specific purpose claim
  sub: string; // User ID
  type: OtpType;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtSecretFromGetter = configService.jwtSecret;
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecretFromGetter,
    });
  }

  async validate(payload: JwtPayload): Promise<UserPublicProfileDto> {
    if ("purpose" in payload && payload.purpose === "otp-verification") {
      throw new UnauthorizedException("Invalid token type.");
    }
    const user = await this.usersService.findOneById(payload.sub);
    if (!user?.isActive) {
      throw new UnauthorizedException("User not found or inactive.");
    }
    return UserPublicProfileDto.fromUserEntity(user);
  }
}
