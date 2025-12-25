require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  PRIVATE_CHANNEL_ID: process.env.PRIVATE_CHANNEL_ID,
  PORT: process.env.PORT || 3000,
  REQUIRED_REFERRALS: 6
};
