import { defineConfig } from 'prisma/config';
import { getApiEnv } from './src/config/api-env';

const apiEnv = getApiEnv();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: apiEnv.DATABASE_URL,
  },
});
