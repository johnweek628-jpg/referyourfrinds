import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN, MAIN_CHANNEL_ID } from './config.js';
import { getUser, createUser } from './db.js';
import { handleReferral } from './referral.js';
import { mainKeyboard } from './keyboard.js';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Bot started successfully');

/**
 * /start command
 */
bot.onText(/\/start(?:\s(\d+))?/, async (msg, match) => {
  const userId = msg.from.id;
  const referrerId = match?.[1] ? Number(match[1]) : null;

  let user = getUser(userId);
  if (!user) user = createUser(userId);

  await handleReferral(userId, referrerId);

  try {
    const member = await bot.getChatMember(MAIN_CHANNEL_ID, userId);
    if (['left', 'kicked'].includes(member.status)) {
      return bot.sendMessage(userId, "🚫 Davom etish uchun avval kanalga qo‘shiling.", {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "📢 Kanalga qo‘shilish",
              url: `https://t.me/${MAIN_CHANNEL_ID.replace('@', '')}`
            }]
          ]
        }
      });
    }
  } catch (e) {
    console.error('Channel check failed:', e.message);
    return;
  }

const referralLink = `https://t.me/${process.env.BOT_USERNAME}?start=${userId}`;

  await bot.sendMessage(
    userId,
    `🎉 Rahmat!\n\n🔗 Sizning shaxsiy referral havolangiz:\n${referralLink}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{
            text: "📤 Do‘stlarga ulashish",
            switch_inline_query:
`🎓 8 yillik tajribaga ega IELTS 7.5, CEFR C1 darajasidagi ustozlardan bepul online darslar va maslahatlarga ega bo‘lish uchun shu kanalga qo‘shilib oling 👇

${referralLink}`
          }]
        ]
      }
    }
  );
});
