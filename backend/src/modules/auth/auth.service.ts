import { UserPublicProfileDto } from "#modules/users/dtos/user-public-profile.dto.js";
import { User } from "#modules/users/entities/user.entity.js";
import { UsersService } from "#modules/users/services/user.service.js";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Repository } from "typeorm";

import { AuthResponse, RegisterDto } from "./auth.dto.js";
import { JwtPayload } from "./strategies/jwt.strategy.js";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async login(userDto: UserPublicProfileDto): Promise<AuthResponse> {
    // Receives the DTO of the validated user from passport local strategy

    const payload: JwtPayload = {
      email: userDto.email,
      roles: userDto.roles,
      sub: userDto.id,
    };

    const now = new Date();

    await this.userRepository.update(
      { id: userDto.id },
      {
        lastLoginAt: now,
      },
    );

    return {
      accessToken: this.jwtService.sign(payload),
      user: Object.assign(userDto, {
        lastLoginAt: now,
      }),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.createUser({
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...registerDto,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async validateUserByPassword(email: string, pass: string): Promise<null | UserPublicProfileDto> {
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (user && (await user.comparePassword(pass))) {
      if (!user.isActive) {
        throw new UnauthorizedException("Account is not active. Please complete registration or contact support.");
      }
      return UserPublicProfileDto.fromUserEntity(user);
    }
    return null;
  }
}
