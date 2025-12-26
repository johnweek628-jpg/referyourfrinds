import TelegramBot from 'node-telegram-bot-api';
import {
  BOT_TOKEN,
  MAIN_CHANNEL_ID,
  MAIN_CHANNEL_USERNAME,
  BOT_USERNAME
} from './config.js';

import { getUser, createUser, confirmReferral } from './db.js';
import { joinConfirmKeyboard } from './keyboard.js';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Bot is alive and kicking');

/**
 * Check if user is a channel member
 */
async function isMember(userId) {
  try {
    const member = await bot.getChatMember(MAIN_CHANNEL_ID, userId);
    return !['left', 'kicked'].includes(member.status);
  } catch {
    return false;
  }
}

/**
 * /start command
 */
bot.onText(/\/start(?:\s(\d+))?/, async (msg, match) => {
  const userId = msg.from.id;
  const referrerId = match?.[1] ? Number(match[1]) : null;

  let user = getUser(userId);
  if (!user) user = createUser(userId);

  // Save referral but DO NOT count yet
  if (
    referrerId &&
    referrerId !== userId &&
    !user.referredBy
  ) {
    user.pendingReferrer = referrerId;
  }

  const member = await isMember(userId);

  if (!member) {
    return bot.sendMessage(
      userId,
      "🚫 Avval kanalga qo‘shiling, so‘ng tasdiqlang:",
      joinConfirmKeyboard(MAIN_CHANNEL_USERNAME)
    );
  }

  sendReferral(userId);
});

/**
 * Confirm join button
 */
bot.on('callback_query', async (query) => {
  if (query.data !== 'confirm_join') return;

  const userId = query.from.id;
  const user = getUser(userId);
  if (!user) return;

  const member = await isMember(userId);

  if (!member) {
    return bot.answerCallbackQuery(query.id, {
      text: "❌ Siz hali kanalga qo‘shilmadingiz",
      show_alert: true
    });
  }

  // ✅ CONFIRM & COUNT REFERRAL (ONCE)
  if (user.pendingReferrer && !user.referredBy) {
    const referrerId = user.pendingReferrer;

    const confirmed = confirmReferral(userId, referrerId);

    if (confirmed) {
      const referrer = getUser(referrerId);

      // 🔔 ALWAYS notify referrer
      await bot.sendMessage(
        referrerId,
        `🎉 Tabriklaymiz!\n\n👥 Sizning taklif qilgan do‘stlaringiz soni: ${referrer.referrals}`
      );
    }

    delete user.pendingReferrer;
  }

  await bot.answerCallbackQuery(query.id, {
    text: "✅ Tasdiq muvaffaqiyatli!"
  });

  sendReferral(userId);
});

/**
 * Send referral link (WORKING SHARE BUTTON)
 */
function sendReferral(userId) {
  const referralLink = `https://t.me/${BOT_USERNAME}?start=${userId}`;

  const shareText =
`🎓 IELTS 7.5 / CEFR C1 sertifikatiga ega,
8 yillik tajribali Jasurbek va Javohirdan
bepul darslar va foydali materiallarni olish uchun
shu kanalga qo‘shilib oling 👇

${referralLink}`;

  bot.sendMessage(
    userId,
    `🎉 Tabriklaymiz!

🔗 Sizning shaxsiy referral havolangiz:
${referralLink}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📤 Do‘stlarga ulashish",
              switch_inline_query: shareText
            }
          ]
        ]
      }
    }
  );
}
