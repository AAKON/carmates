import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
}

export const env: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  MONGO_URI:
    process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/car-platform',
  JWT_SECRET: process.env.JWT_SECRET ?? ''
};

if (!env.MONGO_URI) {
  // eslint-disable-next-line no-console
  console.warn('MONGO_URI is not set. Using default local URL.');
}

if (!env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET is not set. JWT signing will use an empty secret – set JWT_SECRET in .env');
}

