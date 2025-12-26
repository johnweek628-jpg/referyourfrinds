import dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID;
export const MAIN_CHANNEL_USERNAME = process.env.MAIN_CHANNEL_USERNAME;

if (!BOT_TOKEN || !MAIN_CHANNEL_ID || !MAIN_CHANNEL_USERNAME) {
  console.error('❌ Missing environment variables in .env');
  process.exit(1);
}
