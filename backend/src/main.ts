import { AppModule } from "#app.module.js";
import { initAdapters } from "#common/adapters/adapter.init.js";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: "*" });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  initAdapters(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
