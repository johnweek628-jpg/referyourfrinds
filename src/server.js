const express = require('express');
const { PORT } = require('./config');
require('./bot');

const app = express();

app.get('/', (_, res) => {
  res.send('Telegram Referral Bot is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
