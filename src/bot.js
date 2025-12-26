const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const { BOT_TOKEN, MAIN_CHANNEL_ID } = require('./config');
const { getUser, createUser } = require('./db');
const { handleReferral } = require('./referral');
const { mainKeyboard } = require('./keyboard');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

/**
 * /start command with optional referral ID
 */
bot.onText(/\/start(?:\s(\d+))?/, async (msg, match) => {
  const userId = msg.from.id;
  const referrerId = match[1] ? Number(match[1]) : null;

  // Ensure user exists
  let user = getUser(userId);
  if (!user) {
    user = createUser(userId);
  }

  // Handle referral safely
  await handleReferral(userId, referrerId);

  // Check if user joined main channel
  try {
    const member = await bot.getChatMember(MAIN_CHANNEL_ID, userId);

    if (['left', 'kicked'].includes(member.status)) {
      return bot.sendMessage(
        userId,
        "🚫 Davom etish uchun avval kanalga qo‘shiling.",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📢 Kanalga qo‘shilish",
                  url: `https://t.me/${MAIN_CHANNEL_ID.replace('@', '')}`
                }
              ]
            ]
          }
        }
      );
    }
  } catch (err) {
    console.error("Channel check failed:", err.message);
    return;
  }

  const referralLink = `https://t.me/${bot.options.username}?start=${userId}`;

  // ✅ FINAL MESSAGE WITH SHARE BUTTON
  await bot.sendMessage(
    userId,
    `🎉 Rahmat!\n\n🔗 Sizning shaxsiy referral havolangiz:\n${referralLink}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📤 Do‘stlarga ulashish",
              switch_inline_query:
`🎓 8 yillik tajribaga ega IELTS 7.5, CEFR C1 darajasidagi ustozlardan bepul online darslar va maslahatlarga ega bo‘lish uchun shu kanalga qo‘shilib oling 👇

${referralLink}`
            }
          ]
        ]
      }
    }
  );
});

/**
 * Button menu handler
 */
bot.on('message', async (msg) => {
  if (!msg.text) return;

  const userId = msg.from.id;
  const text = msg.text;
  const user = getUser(userId);

  if (!user) return;

  if (text === "📊 My Referrals") {
    return bot.sendMessage(
      userId,
      `📈 Siz *${user.referrals}* ta odamni taklif qildingiz.\nDavom eting 🚀`,
      { parse_mode: 'Markdown' }
    );
  }

  if (text === "🔗 My Referral Link") {
    return bot.sendMessage(
      userId,
      `🔗 Sizning referral havolangiz:\nhttps://t.me/${bot.options.username}?start=${userId}`
    );
  }
});

module.exports = bot;
