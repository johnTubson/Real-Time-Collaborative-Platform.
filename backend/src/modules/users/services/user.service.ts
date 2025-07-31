import { OtpType, UserRole } from "#common/users/enums.js";
import { RegisterDto } from "#modules/auth/auth.dto.js";
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { addMinutes } from "date-fns";
import { FindOptionsWhere, Repository } from "typeorm";

import { UpdateUserProfileInput } from "../dtos/update-user.input.js";
import { Otp } from "../entities/otp.entity.js";
import { User } from "../entities/user.entity.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpsRepository: Repository<Otp>,
  ) {}

  // OTP Related Methods
  async createOtp(userId: string, type: OtpType, expiresInMinutes = 5): Promise<Otp> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException("User not found for OTP generation.");

    // Invalidate previous OTPs of the same type for this user
    await this.otpsRepository.update(
      { isUsed: false, type, userId },
      { expiresAt: new Date(), isUsed: true }, // Mark as used and expired
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = addMinutes(new Date(), expiresInMinutes);

    const newOtp = this.otpsRepository.create({
      code,
      expiresAt,
      type,
      user, // Associate user object
      userId,
    });
    return this.otpsRepository.save(newOtp);
  }

  async createUser(createUserInput: RegisterDto): Promise<User> {
    const { email, firstName, lastName, password } = createUserInput;

    const restOfInput = {
      firstName,
      lastName,
      password,
    };

    const existingUserByEmail = await this.findOneByEmail(email);

    if (existingUserByEmail?.isActive) {
      throw new ConflictException("User with this email already exists and is active.");
    }

    // Use existing inactive record or create new
    const userToSave = this.usersRepository.create({
      ...restOfInput,
      email: email.toLowerCase(),
    });

    userToSave.isActive = false;
    userToSave.isPhoneNumberVerified = false;
    userToSave.isEmailVerified = false;
    userToSave.roles = [UserRole.NOT_ACTIVATED];

    try {
      return await this.usersRepository.save(userToSave);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        // Unique constraint violation
        throw new ConflictException("Email already exists.");
      }
      throw new InternalServerErrorException("Failed to create user.");
    }
  }

  // Admin methods
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(where: FindOptionsWhere<User>): Promise<null | User> {
    return this.usersRepository.findOne({ where });
  }

  async findOneByEmail(email: string): Promise<null | User> {
    return this.usersRepository.findOneBy({ email: email.toLowerCase() });
  }

  async findOneByEmailWithPassword(email: string): Promise<null | User> {
    return this.usersRepository.createQueryBuilder("user").where("LOWER(user.email) = LOWER(:email)", { email }).addSelect("user.password").getOne();
  }

  async findOneById(id: string): Promise<null | User> {
    return this.usersRepository.findOneBy({ id });
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<null | User> {
    return this.usersRepository.findOneBy({ phoneNumber });
  }

  async findOneByReferralCode(referralCode: string): Promise<null | User> {
    return this.usersRepository.findOneBy({ referralCode });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async updateUserProfile(userId: string, input: UpdateUserProfileInput): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException("User not found.");
    }

    // Prevent changing email/phone directly without verification
    // For now, allow simple updates
    Reflect.deleteProperty(input, "password");
    Object.assign(user, input);
    if (input.birthday) {
      user.birthday = new Date(input.birthday);
    }

    return this.usersRepository.save(user);
  }

  async verifyOtp(identifier: string, code: string, type: OtpType): Promise<null | User> {
    const user = type === OtpType.PHONE_VERIFICATION ? await this.findOneByPhoneNumber(identifier) : await this.findOneByEmail(identifier);

    if (!user) {
      throw new NotFoundException(`User with ${identifier} not found.`);
    }

    const otpRecord = await this.otpsRepository.findOne({
      order: { createdAt: "DESC" }, // Get the latest OTP if multiple exist (shouldn't due to invalidation)
      where: {
        code,
        isUsed: false,
        type,
        userId: user.id,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException("Invalid or already used OTP code.");
    }

    if (new Date() > otpRecord.expiresAt) {
      otpRecord.isUsed = true; // Mark as used even if expired
      await this.otpsRepository.save(otpRecord);
      throw new BadRequestException("OTP code has expired.");
    }

    otpRecord.isUsed = true;
    await this.otpsRepository.save(otpRecord);

    return user; // Return the user associated with the valid OTP
  }
}
