import { UserRole } from "#common/users/enums.js";

import { User } from "../entities/user.entity.js";

/**
 * UserPublicProfileDto represents the publicly accessible (non-sensitive)
 * information for a user. It's used for API responses where the full
 * User entity (including methods or sensitive fields) is not appropriate.
 */
export class UserPublicProfileDto {
  address?: string;

  birthday?: Date;

  createdAt!: Date;

  email!: string;

  firstName!: string;

  id!: string;

  isActive!: boolean;

  isEmailVerified!: boolean;

  isPhoneNumberVerified!: boolean;

  lastLoginAt?: Date;

  lastName!: string;

  phoneNumber!: string;

  referralCode?: string;

  referredById?: string;

  roles!: UserRole[];

  updatedAt!: Date;

  /**
   * Constructor to allow creating an instance from a partial object.
   * @param partial - Partial data to initialize the DTO.
   */
  constructor(partial: Partial<UserPublicProfileDto>) {
    Object.assign(this, partial);
  }

  /**
   * Static factory method to create a UserPublicProfileDto from a User entity.
   * This is the preferred way to ensure correct mapping.
   * @param user - The User entity instance.
   * @returns A new UserPublicProfileDto instance.
   */
  public static fromUserEntity(user: User): UserPublicProfileDto {
    return new UserPublicProfileDto({
      address: user.address,
      birthday: user.birthday,
      createdAt: user.createdAt,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneNumberVerified: user.isPhoneNumberVerified,
      lastLoginAt: user.lastLoginAt,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      referralCode: user.referralCode,
      referredById: user.referredById,
      roles: user.roles,
      updatedAt: user.updatedAt,
    });
  }
}
