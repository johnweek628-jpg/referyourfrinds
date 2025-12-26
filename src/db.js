// db.js

const users = new Map();

/**
 * Get user by Telegram ID
 */
export function getUser(userId) {
  return users.get(userId);
}

/**
 * Create new user
 */
export function createUser(userId) {
  const user = {
    id: userId,
    referrals: 0,
    referredBy: null,
    pendingReferrer: null
  };

  users.set(userId, user);
  return user;
}

/**
 * Increment referral count
 */
export function addReferral(referrerId) {
  const referrer = users.get(referrerId);
  if (referrer) {
    referrer.referrals += 1;
  }
}
