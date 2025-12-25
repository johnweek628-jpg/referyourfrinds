const express = require('express');
const { PORT } = require('./config');

// Boot the bot (polling starts here)
require('./bot');

const app = express();

app.get('/', (_req, res) => {
  res.status(200).send('🤖 Telegram Referral Bot is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
