import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import express from 'express';
import { randomUUID } from 'crypto';

dotenv.config();

/* ───────────── ENV ───────────── */
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.MAIN_CHANNEL_ID;
const CHANNEL_LINK = process.env.CHANNEL_LINK;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !CHANNEL_ID || !CHANNEL_LINK) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

/* ───────────── BOT ───────────── */
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on('polling_error', err => {
  console.error('🚨 Polling error:', err.message);
});

/* ───────────── STORAGE ───────────── */
const DATA_FILE = './users.json';
let users = {};

if (fs.existsSync(DATA_FILE)) {
  users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

function getUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      code: randomUUID(),
      referrals: [],
      active: false
    };
    saveUsers();
  }
  return users[userId];
}

function referralLink(user, botUsername) {
  return `https://t.me/${botUsername}?start=${user.code}`;
}

/* ───────────── /start HANDLER ───────────── */
bot.onText(/\/start(?:\s(.+))?/, async (msg, match) => {
  const userId = msg.from.id.toString();
  const refCode = match?.[1] || null;

  const user = getUser(userId);

  /* 🔒 Channel check */
  try {
    const member = await bot.getChatMember(CHANNEL_ID, userId);
    if (['left', 'kicked'].includes(member.status)) {
      return bot.sendMessage(userId, '🚫 Please join our channel first.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 Join Channel', url: CHANNEL_LINK }]
          ]
        }
      });
    }
  } catch (err) {
    return bot.sendMessage(userId, '⚠️ Bot must be admin in the channel.');
  }

  user.active = true;

  /* 🎯 REFERRAL LOGIC */
  if (refCode) {
    const referrerEntry = Object.entries(users).find(
      ([_, u]) => u.code === refCode
    );

    if (referrerEntry) {
      const [referrerId, referrer] = referrerEntry;

      if (
        referrerId !== userId &&
        referrer.active &&
        !referrer.referrals.includes(userId)
      ) {
        referrer.referrals.push(userId);
        saveUsers();

        /* 🔔 Notify referrer (GUARDED) */
        try {
          console.log(`📤 Notifying referrer ${referrerId}`);

          await bot.sendMessage(
            referrerId,
            `🎉 New referral!\n👥 Total referrals: ${referrer.referrals.length}`
          );

          console.log('✅ Notification sent');
        } catch (err) {
          console.error(
            `❌ Failed to notify ${referrerId}:`,
            err.message
          );
        }
      }
    }
  }

  saveUsers();

  const me = await bot.getMe();

  await bot.sendMessage(
    userId,
    `✅ Welcome!\n\n🔗 Your referral link:\n${referralLink(user, me.username)}\n\n👥 Total people you referred: ${user.referrals.length}`
  );
});

/* ───────────── EXPRESS (HOSTING) ───────────── */
const app = express();

app.get('/', (_req, res) => {
  res.send('🤖 Telegram Referral Bot is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
