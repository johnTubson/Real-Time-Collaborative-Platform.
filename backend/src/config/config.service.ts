import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

import { EnvSchema } from "./schemas/env.schema.js";

@Injectable()
export class ConfigService {
  // Database configurations
  get dbHost(): string {
    return this.get("DATABASE_HOST");
  }

  get dbName(): string {
    return this.get("DATABASE_NAME");
  }

  get dbPassword(): string {
    return this.get("DATABASE_PASSWORD");
  }

  get dbPort(): number {
    return this.get("DATABASE_PORT");
  }

  get dbUsername(): string {
    return this.get("DATABASE_USERNAME");
  }
  get emailFrom(): string {
    return this.get("EMAIL_FROM");
  }
  get getTermiiApiToken(): string {
    return this.get("TERMII_API_TOKEN");
  }
  // OTP Verification JWT configurations
  get getTermiiApiUrl(): string {
    return this.get("TERMII_API_URL");
  }
  get getZeptoApiToken(): string {
    return this.get("ZEPTO_API_URL");
  }

  get getZeptoApiUrl(): string {
    return this.get("ZEPTO_API_TOKEN");
  }
  get isDevelopment(): boolean {
    return this.get("NODE_ENV") === "development";
  }

  get jwtExpirationTime(): string {
    return this.get("JWT_EXPIRATION_TIME");
  }
  // JWT configurations
  get jwtSecret(): string {
    return this.get("JWT_SECRET");
  }

  get otpVerificationJwtExpirationTime(): string {
    return this.get("OTP_VERIFICATION_JWT_EXPIRATION_TIME");
  }
  // OTP Verification JWT configurations
  get otpVerificationJwtSecret(): string {
    return this.get("OTP_VERIFICATION_JWT_SECRET");
  }

  get port(): number {
    return this.get("PORT");
  }
  constructor(private nestConfigService: NestConfigService<EnvSchema, true>) {}
  get<T extends keyof EnvSchema>(key: T): EnvSchema[T] {
    return this.nestConfigService.get(key, { infer: true });
  }
}
