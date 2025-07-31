import { User } from "#modules/users/entities/user.entity.js";
import { Body, Controller, Get, Post, Request, UnauthorizedException, UseGuards } from "@nestjs/common";

import { RegisterDto } from "./auth.dto.js";
import { AuthService } from "./auth.service.js";
import { CurrentUser, RequestWithUser } from "./decorators/current-user.decorator.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { LocalAuthGuard } from "./guards/local-auth.guard.js";

@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User): null | User {
    return user;
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: RequestWithUser) {
    // After LocalAuthGuard runs successfully, context.req.user will be populated by LocalStrategy.validate

    if (!req.user) {
      throw new UnauthorizedException("Login failed: User not authorized.");
    }
    return this.authService.login(req.user);
  }

  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
