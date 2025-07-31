import { ConfigService } from "#config/config.service.js";
import { UsersModule } from "#modules/users/user.module.js";
import { forwardRef, Global, Logger, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.contoller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { LocalStrategy } from "./strategies/local.strategy.js";

@Global()
@Module({
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.jwtSecret;
        if (!secret || secret.length === 0) {
          new Logger("JwtModule").error("JWT_SECRET is undefined or empty during JwtModule.registerAsync. Check .env and ConfigService.");
          throw new Error("JWT_SECRET is not configured for JwtModule.");
        }
        return {
          secret: secret,
          signOptions: {
            expiresIn: configService.jwtExpirationTime,
          },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
