import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const envFilePath = resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envFilePath });

async function bootstrap() {
  console.log('ENV file path:', envFilePath);
  console.log('DATABASE_URL exists:', Boolean(process.env.DATABASE_URL));

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
