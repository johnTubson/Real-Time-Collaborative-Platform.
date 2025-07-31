import { ConfigService } from "#config/config.service.js";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

// This function will be used by TypeOrmModule.forRootAsync
export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  autoLoadEntities: true,
  database: configService.dbName,
  host: configService.dbHost,
  logging: configService.isDevelopment ? "all" : ["error"],
  migrations: [import.meta.dirname + "/../migrations/*{.ts,.js}"],
  migrationsTableName: "migrations",
  password: configService.dbPassword,
  port: configService.dbPort,
  ssl: configService.isDevelopment ? false : { rejectUnauthorized: false },
  synchronize: false,
  type: "postgres",
  username: configService.dbUsername,
});
