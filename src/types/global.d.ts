declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    DATABASE_URL: string;
    STRIPE_SECRET_KEY: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    GOOGLE_AI_API_KEY: string;
    UPLOADTHING_SECRET: string;
    UPLOADTHING_APP_ID: string;
  }
}

declare global {
  interface Window {
    process?: {
      env: Record<string, string | undefined>;
      browser?: boolean;
      [key: string]: any;
    };
  }
}

export {};
