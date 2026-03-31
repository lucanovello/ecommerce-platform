import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getApiEnv } from './config/api-env';

async function bootstrap() {
  const env = getApiEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: env.CORS_ORIGIN,
  });

  await app.listen(env.PORT);
}
bootstrap();
