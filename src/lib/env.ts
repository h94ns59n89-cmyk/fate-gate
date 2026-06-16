const env = {
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  redis: {
    url: process.env.REDIS_URL ?? '',
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID ?? '',
    appSecret: process.env.WECHAT_APP_SECRET ?? '',
    mchId: process.env.WECHAT_MCH_ID ?? '',
    apiKey: process.env.WECHAT_API_KEY ?? '',
    notifyUrl: process.env.WECHAT_NOTIFY_URL ?? '',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? '',
    deepseekModel: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '2592000', 10),
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucketName: process.env.R2_BUCKET_NAME ?? 'fate-gate-public',
    publicUrl: process.env.R2_PUBLIC_URL ?? '',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN ?? '',
  },
  features: {
    enableMock: process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true',
    enableTimeGuess: process.env.NEXT_PUBLIC_ENABLE_TIME_GUESS === 'true',
  },
} as const;

export function getEnv() {
  return env;
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
