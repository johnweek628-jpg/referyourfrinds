import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve absolute path safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'users.json');

let users = {};

// Load users safely
try {
  if (fs.existsSync(DB_FILE)) {
    users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
} catch (err) {
  console.error('❌ Failed to load users.json:', err);
  users = {};
}

function save() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('❌ Failed to save users.json:', err);
  }
}

// ✅ GET USER
export function getUser(userId) {
  return users[userId] || null;
}

// ✅ CREATE USER
export function createUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      referrals: 0,
      joinedAt: Date.now()
    };
    save();
  }
  return users[userId];
}

// ✅ ADD REFERRAL
export function addReferral(referrerId) {
  if (!users[referrerId]) return false;
  users[referrerId].referrals += 1;
  save();
  return true;
}
