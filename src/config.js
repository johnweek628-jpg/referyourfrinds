require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  MAIN_CHANNEL_ID: process.env.MAIN_CHANNEL_ID,
  PORT: process.env.PORT || 3000
};
