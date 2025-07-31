import { OtpType } from "#common/users/enums.js";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

import { User } from "./user.entity.js";

@Entity("otps")
export class Otp {
  @Column({ length: 6, type: "varchar" })
  code!: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @Column({ type: "timestamp with time zone" })
  expiresAt!: Date;

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, type: "boolean" })
  isUsed!: boolean;

  @Column({
    enum: OtpType,
    type: "enum",
  })
  type!: OtpType;

  @JoinColumn({ name: "userId" })
  @ManyToOne(() => User, (user) => user.otps, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: Relation<User>;

  @Column("uuid")
  @Index()
  userId!: string;
}
