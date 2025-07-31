import { User } from "#modules/users/entities/user.entity.js";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("rooms")
export class Room {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => User, (user) => user.id)
  ownerId!: string;

  @Column({
    length: 255,
    nullable: false,
    type: "varchar",
  })
  roomCode!: string;

  @Column({
    length: 255,
    nullable: false,
    type: "varchar",
  })
  roomName!: string;
}
