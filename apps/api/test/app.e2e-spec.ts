import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { resetApiEnv } from './../src/config/api-env';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.APP_ENV = 'test';
    process.env.PORT = '4000';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/ecommerce';
    process.env.REDIS_URL = 'redis://localhost:6379';
    resetApiEnv();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
