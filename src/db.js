import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* Resolve absolute path */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'users.json');

let users = {};

/* Load database */
try {
  if (fs.existsSync(DB_FILE)) {
    users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
} catch (err) {
  console.error('❌ Failed to load users.json:', err);
  users = {};
}

/* Save database */
function save() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('❌ Failed to save users.json:', err);
  }
}

/* Get user */
export function getUser(userId) {
  return users[userId] || null;
}

/* Create user if not exists */
export function createUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      referrals: 0,
      referredBy: null,
      referralConfirmed: false,
      pendingReferrer: null
    };
    save();
  }
  return users[userId];
}

/**
 * ✅ CONFIRM REFERRAL (COUNT ONCE, SAFELY)
 * This is EXACTLY what bot.js expects
 */
export function confirmReferral(userId, referrerId) {
  const user = users[userId];
  const referrer = users[referrerId];

  if (!user || !referrer) return false;
  if (user.referralConfirmed) return false;
  if (userId === referrerId) return false;

  user.referredBy = referrerId;
  user.referralConfirmed = true;
  user.pendingReferrer = null;

  referrer.referrals += 1;

  save();
  return true;
}
