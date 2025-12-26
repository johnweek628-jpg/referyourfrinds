import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('❌ BOT_TOKEN is missing');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Bot started successfully');

export default bot;
