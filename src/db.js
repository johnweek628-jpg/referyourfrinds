const users = new Map();

/**
 * Create a new user if they do not exist
 */
function createUser(userId) {
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      referrals: 0,
      referredBy: null,
      referralsList: new Set()
    });
  }
  return users.get(userId);
}

/**
 * Get an existing user (returns null if not found)
 */
function getUser(userId) {
  return users.get(userId) || null;
}

/**
 * Add a unique referral safely
 */
function addReferral(referrerId, newUserId) {
  const referrer = users.get(referrerId);
  if (!referrer) return false;

  // Prevent duplicate referrals
  if (referrer.referralsList.has(newUserId)) {
    return false;
  }

  referrer.referralsList.add(newUserId);
  referrer.referrals += 1;
  return true;
}

module.exports = {
  users,
  createUser,
  getUser,
  addReferral
};
