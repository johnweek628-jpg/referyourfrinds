import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

dotenv.config();

const token = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const CHANNEL_LINK = process.env.CHANNEL_LINK;
const BOT_USERNAME = process.env.BOT_USERNAME;
const DATA_FILE = './users.json';

if (!token || !CHANNEL_ID || !BOT_USERNAME || !CHANNEL_LINK) {
  console.error('Missing environment variables');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Load users
let users = {};
if (fs.existsSync(DATA_FILE)) {
  users = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save users
function saveUsers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
