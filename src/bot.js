const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN, PRIVATE_CHANNEL_ID, REQUIRED_REFERRALS } = require('./config');
const { getUser } = require('./db');
const { handleReferral } = require('./referral');
const { mainKeyboard } = require('./keyboard');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start(?:\s(\d+))?/, (msg, match) => {
  const userId = msg.from.id;
  const referrerId = match[1] ? Number(match[1]) : null;

  handleReferral(userId, referrerId);
  getUser(userId);

  bot.sendMessage(
    userId,
    "Welcome aboard 🚀\nInvite friends and unlock the private channel.",
    mainKeyboard()
  );
});

bot.on('message', async (msg) => {
  const userId = msg.from.id;
  const text = msg.text;
  const user = getUser(userId);

  if (text === "📊 My Referrals") {
    bot.sendMessage(
      userId,
      `You have *${user.referrals}* referrals.\nYou need *${REQUIRED_REFERRALS}* to unlock.`,
      { parse_mode: "Markdown" }
    );
  }

  if (text === "🔗 My Referral Link") {
    bot.sendMessage(
      userId,
      `Your referral link:\nhttps://t.me/${bot.username}?start=${userId}`
    );
  }

  if (text === "🔓 Unlock Channel") {
    if (!user.unlocked) {
      return bot.sendMessage(
        userId,
        `⛔ Access denied.\nInvite ${REQUIRED_REFERRALS - user.referrals} more users.`
      );
    }

    try {
      await bot.createChatInviteLink(PRIVATE_CHANNEL_ID, { member_limit: 1 });
      const invite = await bot.createChatInviteLink(PRIVATE_CHANNEL_ID);

      bot.sendMessage(userId, `✅ Access granted:\n${invite.invite_link}`);
    } catch (err) {
      bot.sendMessage(userId, "⚠️ Failed to generate invite link.");
    }
  }
});

module.exports = bot;
