import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import express from 'express';

dotenv.config();

// --- Environment variables ---
const token = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const CHANNEL_LINK = process.env.CHANNEL_LINK;
const BOT_USERNAME = process.env.BOT_USERNAME;
const DATA_FILE = './users.json';

if (!token || !CHANNEL_ID || !BOT_USERNAME || !CHANNEL_LINK) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

// --- Initialize Telegram bot ---
const bot = new TelegramBot(token, { polling: true });

// --- Load users from file ---
let users = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    console.error('Error reading users.json:', err);
    users = {};
  }
}

// --- Save users to file ---
function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// --- Generate referral link ---
function getReferralLink(userId) {
  if (!users[userId]) {
    users[userId] = { code: uuidv4(), confirmed: false, referrals: [] };
    saveUsers();
  }
  return `https://t.me/${BOT_USERNAME}?start=${users[userId].code}`;
}

// --- /start command ---
bot.onText(/\/start(?:\s(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const refCode = match ? match[1] : null;

  if (!users[chatId]) {
    users[chatId] = { code: uuidv4(), confirmed: false, referrals: [] };
    saveUsers();
  }

  try {
    const member = await bot.getChatMember(CHANNEL_ID, chatId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, '❌ Please join our channel first.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 Join Channel', url: CHANNEL_LINK }],
            [{ text: '✅ Confirm', callback_data: 'confirm_join' }]
          ]
        }
      });
    }
    users[chatId].confirmed = true;
    saveUsers();
  } catch {
    return bot.sendMessage(chatId, '⚠️ Bot must be admin in the channel.');
  }

  // Handle referrals
  if (refCode && refCode !== users[chatId].code) {
    const refEntry = Object.entries(users).find(([_, u]) => u.code === refCode);
    if (refEntry) {
      const [refId, refData] = refEntry;
      if (!refData.referrals.includes(chatId)) {
        refData.referral
