const { createUser, addReferral } = require('./db');

async function handleReferral(userId, referrerId) {
  // No referrer or self-referral
  if (!referrerId || referrerId === userId) return;

  // Ensure users exist
  const user = createUser(userId);
  createUser(referrerId);

  // User can only be referred once
  if (user.referredBy) return;

  // Add referral uniquely
  const added = addReferral(referrerId, userId);
  if (!added) return;

  // Record who referred this user
  user.referredBy = referrerId;
}

module.exports = { handleReferral };
