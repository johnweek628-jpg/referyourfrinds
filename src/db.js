import fs from 'fs';

const DB_FILE = './users.json';

let users = {};

// Load users from file
if (fs.existsSync(DB_FILE)) {
  users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

// ✅ GET USER
export function getUser(userId) {
  return users[userId] || null;
}

// ✅ CREATE USER
export function createUser(userId) {
  users[userId] = {
    referrals: 0
  };
  save();
  return users[userId];
}

// ✅ ADD REFERRAL SAFELY
export function addReferral(referrerId, newUserId) {
  if (!users[referrerId]) return false;
  users[referrerId].referrals += 1;
  save();
  return true;
}
