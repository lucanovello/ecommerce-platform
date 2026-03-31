import { z } from "zod";

const APP_ENV_VALUES = ["development", "test", "production"] as const;

const webEnvSchema = z.object({
  APP_ENV: z.enum(APP_ENV_VALUES),
  NEXT_PUBLIC_API_URL: z.string().trim().min(1).refine(isHttpUrl, {
    message: "must be an absolute http or https URL",
  }),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

let cachedWebEnv: WebEnv | undefined;

export function getWebEnv(): WebEnv {
  if (cachedWebEnv) {
    return cachedWebEnv;
  }

  const parsedEnv = webEnvSchema.safeParse({
    APP_ENV: process.env.APP_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsedEnv.success) {
    throw new Error(formatWebEnvError(parsedEnv.error));
  }

  cachedWebEnv = parsedEnv.data;
  return cachedWebEnv;
}

function formatWebEnvError(error: z.ZodError) {
  const issues = error.issues.map((issue) => {
    const field = issue.path.join(".") || "ENV";
    return `- ${field}: ${issue.message}`;
  });

  return ["Web environment validation failed.", ...issues].join("\n");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
