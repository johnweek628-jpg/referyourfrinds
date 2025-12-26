import TelegramBot from 'node-telegram-bot-api';
import {
  BOT_TOKEN,
  MAIN_CHANNEL_ID,
  MAIN_CHANNEL_USERNAME,
  BOT_USERNAME
} from './config.js';
import { getUser, createUser, addReferral } from './db.js';
import { joinConfirmKeyboard, mainKeyboard } from './keyboard.js';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Bot is alive and kicking');

/**
 * Check channel membership
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
 * /start handler
 */
bot.onText(/\/start(?:\s(\d+))?/, async (msg, match) => {
  const userId = msg.from.id;
  const referrerId = match?.[1] ? Number(match[1]) : null;

  let user = getUser(userId);
  if (!user) user = createUser(userId);

  // Save pending referral (do NOT count yet)
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
 * Confirm join handler
 */
bot.on('callback_query', async (query) => {
  if (query.data !== 'confirm_join') return;

  const userId = query.from.id;
  const user = getUser(userId);

  const member = await isMember(userId);

  if (!member) {
    return bot.answerCallbackQuery(query.id, {
      text: "❌ Siz hali kanalga qo‘shilmadingiz",
      show_alert: true
    });
  }

  // Count referral ONLY here
  if (
    user.pendingReferrer &&
    !user.referredBy &&
    await isMember(userId)
  ) {
    addReferral(user.pendingReferrer);
    user.referredBy = user.pendingReferrer;
    delete user.pendingReferrer;
  }

  await bot.answerCallbackQuery(query.id, {
    text: "✅ Tasdiq muvaffaqiyatli!"
  });

  sendReferral(userId);
});

/**
 * Send referral link
 */
function sendReferral(userId) {
  const referralLink = `https://t.me/${BOT_USERNAME}?start=${userId}`;

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
              switch_inline_query:
`🎓 Bepul IELTS darslari va foydali materiallar 👇

${referralLink}`
            }
          ]
        ]
      }
    }
  );
}
