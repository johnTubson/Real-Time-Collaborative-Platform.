import { DataSource, DataSourceOptions } from "typeorm";

const loadEnvConfig = () => {
  return {
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    nodeEnv: process.env.NODE_ENV ?? "development",
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
    username: process.env.DATABASE_USERNAME,
  };
};

const envConfig = loadEnvConfig();

export const dataSourceOptions: DataSourceOptions = {
  database: envConfig.database,
  entities: [import.meta.dirname + "/../**/*entity{.ts,.js}"], // Dynamically load entities
  host: envConfig.host,
  logging: envConfig.nodeEnv === "development" ? ["query", "error"] : ["error"],
  migrations: [import.meta.dirname + "/../migrations/*{.ts,.js}"], // Path to migrations
  migrationsTableName: "migrations",
  password: envConfig.password,
  port: envConfig.port,
  synchronize: false,
  type: "postgres",
  username: envConfig.username,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
