import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { z } from 'zod';

const APP_ENV_VALUES = ['development', 'test', 'production'] as const;

const apiEnvSchema = z.object({
  APP_ENV: z.enum(APP_ENV_VALUES),
  PORT: z.coerce.number().int().min(1).max(65535),
  CORS_ORIGIN: z.string().trim().min(1).refine(isHttpUrl, {
    message: 'must be an absolute http or https URL',
  }),
  DATABASE_URL: z.string().trim().min(1).refine(isPostgresUrl, {
    message: 'must be a PostgreSQL connection string',
  }),
  REDIS_URL: z.string().trim().min(1).refine(isRedisUrl, {
    message: 'must be a Redis connection string',
  }),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

const apiEnvFilePath = resolveApiEnvFilePath();

let cachedApiEnv: ApiEnv | undefined;

export function getApiEnv(): ApiEnv {
  if (cachedApiEnv) {
    return cachedApiEnv;
  }

  loadDotenv({
    path: apiEnvFilePath,
    override: false,
    quiet: true,
  });

  const parsedEnv = apiEnvSchema.safeParse({
    APP_ENV: process.env.APP_ENV,
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
  });

  if (!parsedEnv.success) {
    throw new Error(formatApiEnvError(parsedEnv.error));
  }

  cachedApiEnv = parsedEnv.data;
  return cachedApiEnv;
}

export function resetApiEnv() {
  cachedApiEnv = undefined;
}

function formatApiEnvError(error: z.ZodError) {
  const issues = error.issues.map((issue) => {
    const field = issue.path.join('.') || 'ENV';
    return `- ${field}: ${issue.message}`;
  });

  return [
    `API environment validation failed using ${apiEnvFilePath}.`,
    ...issues,
  ].join('\n');
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isPostgresUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'postgres:' || url.protocol === 'postgresql:';
  } catch {
    return false;
  }
}

function isRedisUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'redis:' || url.protocol === 'rediss:';
  } catch {
    return false;
  }
}

function resolveApiEnvFilePath() {
  const candidatePaths = [
    resolve(process.cwd(), '.env'),
    resolve(__dirname, '..', '..', '.env'),
    resolve(__dirname, '..', '..', '..', '.env'),
  ];

  return (
    candidatePaths.find((candidatePath) => existsSync(candidatePath)) ??
    candidatePaths[0]
  );
}
