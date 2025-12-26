import { getUser, createUser, addReferral } from './db.js';

export async function handleReferral(userId, referrerId) {
  // ❌ No referrer or self-referral
  if (!referrerId || referrerId === userId) return;

  // ✅ Ensure user exists
  let user = getUser(userId);
  if (!user) user = createUser(userId);

  // ✅ Ensure referrer exists
  if (!getUser(referrerId)) {
    createUser(referrerId);
  }

  // ❌ User can only be referred once
  if (user.referredBy) return;

  // ✅ Add referral
  const added = addReferral(referrerId);
  if (!added) return;

  // ✅ Lock referral
  user.referredBy = referrerId;
}
