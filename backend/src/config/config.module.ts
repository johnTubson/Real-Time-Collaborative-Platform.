import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import { ConfigService } from "./config.service.js";
import { envSchema } from "./schemas/env.schema.js";

@Global()
@Module({
  exports: [ConfigService],
  imports: [
    NestConfigModule.forRoot({
      cache: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? "development"}`],
      isGlobal: true,

      validate: (config) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          throw new Error("Environment validation failed. Please check your .env file.");
        }
        return result.data;
      },
    }),
  ],
  providers: [ConfigService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CustomConfigModule {}
