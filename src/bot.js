const TelegramBot = require('node-telegram-bot-api');
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

  // Handle referral safely (unique, no self-referral)
  await handleReferral(userId, referrerId);

  // Check if user joined main channel
  try {
    const member = await bot.getChatMember(MAIN_CHANNEL_ID, userId);

    if (['left', 'kicked'].includes(member.status)) {
      return bot.sendMessage(
        userId,
        "🚫 To continue, please join our main channel first.",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📢 Join Channel",
                  url: `https://t.me/${MAIN_CHANNEL_ID.replace('@', '')}`
                }
              ]
            ]
          }
        }
      );
    }
  } catch (err) {
    console.error("Channel membership check failed:", err.message);
    return;
  }

  // Thank user and send referral link automatically
  await bot.sendMessage(
    userId,
    `🎉 Thanks for joining!\n\nHere’s your personal referral link 👇\nhttps://t.me/${bot.options.username}?start=${userId}`,
    mainKeyboard()
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
      `📈 You’ve referred *${user.referrals}* unique user(s).\nKeep spreading the word 🚀`,
      { parse_mode: 'Markdown' }
    );
  }

  if (text === "🔗 My Referral Link") {
    return bot.sendMessage(
      userId,
      `🔗 Your referral link:\nhttps://t.me/${bot.options.username}?start=${userId}`
    );
  }
});

module.exports = bot;
