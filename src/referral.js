import { getUser, createUser } from './db.js';

/**
 * Handle referral on /start
 * This ONLY stores a pending referrer.
 * Actual counting happens AFTER channel join + confirm.
 */
export function handleReferral(userId, referrerId) {
  // 🚫 No referrer or self-referral
  if (!referrerId || referrerId === userId) return;

  // ✅ Ensure user exists
  let user = getUser(userId);
  if (!user) {
    user = createUser(userId);
  }

  // 🚫 Already confirmed referral → ignore
  if (user.referralConfirmed) return;

  // 🚫 Already has a pending referrer → ignore
  if (user.pendingReferrer) return;

  // ✅ Ensure referrer exists
  createUser(referrerId);

  // ✅ Store pending referrer (DO NOT COUNT YET)
  user.pendingReferrer = referrerId;
}
