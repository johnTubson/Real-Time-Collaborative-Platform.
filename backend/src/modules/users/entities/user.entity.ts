import { UserRole } from "#common/users/enums.js";
import * as bcrypt from "bcryptjs";
import { IsEmail, IsPhoneNumber, Length } from "class-validator";
import { customAlphabet } from "nanoid";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { Otp } from "./otp.entity.js";

@Entity("users")
export class User {
  @Column({ nullable: true, type: "text" })
  address?: string;

  @Column({ nullable: true, type: "date" })
  birthday?: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @Column({ length: 255, type: "varchar", unique: true })
  @Index({ unique: true })
  @IsEmail({}, { message: "Invalid email format." })
  email!: string;

  @Column({ length: 100, type: "varchar" })
  @Length(1, 100, {
    message: "First name must be between 1 and 100 characters.",
  })
  firstName!: string;

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, type: "boolean" }) // Initially false, true after registration complete
  isActive!: boolean;

  @Column({ default: false, type: "boolean" })
  isEmailVerified!: boolean; // For future email verification flow

  @Column({ default: false, type: "boolean" })
  isPhoneNumberVerified!: boolean;

  @Column({ nullable: true, type: "timestamp with time zone" })
  lastLoginAt?: Date;

  @Column({ length: 100, type: "varchar" })
  @Length(1, 100, {
    message: "Last name must be between 1 and 100 characters.",
  })
  lastName!: string;

  @OneToMany(() => Otp, (otp) => otp.user, { cascade: true })
  otps!: Relation<Otp[]>;

  @Column({ nullable: true, type: "text" }) // Nullable until set during registration completion
  password?: string;

  @Column({ length: 20, type: "varchar", unique: true })
  @Index({ unique: true })
  @IsPhoneNumber("NG", { message: "Invalid phone number format." })
  phoneNumber!: string;

  @Column({ length: 10, nullable: true, type: "varchar", unique: true }) // Short, memorable referral codes
  @Index({ unique: true, where: '"referralCode" IS NOT NULL' })
  referralCode?: string;

  @JoinColumn({ name: "referredById" })
  @ManyToOne(() => User, (user) => user.referredUsers, {
    eager: false,
    nullable: true,
    onDelete: "SET NULL",
  })
  referredBy?: User;

  @Column({ name: "referredById", nullable: true, type: "uuid" })
  referredById?: string;

  @OneToMany(() => User, (user) => user.referredBy)
  referredUsers?: User[];

  @Column({
    array: true,
    default: [UserRole.NOT_ACTIVATED],
    enum: UserRole,
    type: "enum",
  })
  roles!: UserRole[];

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;

  async comparePassword(attempt: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(attempt, this.password);
  }

  @BeforeInsert()
  generateReferralCode() {
    if (!this.referralCode) {
      // Generate a unique 8-character alphanumeric referral code
      const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
      this.referralCode = nanoid();
    }
  }

  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }
}
