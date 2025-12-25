const { getUser } = require('./db');
const { REQUIRED_REFERRALS } = require('./config');

function handleReferral(userId, referrerId) {
  if (!referrerId || referrerId === userId) return;

  const user = getUser(userId);
  if (user.referredBy) return;

  user.referredBy = referrerId;

  const referrer = getUser(referrerId);
  referrer.referrals += 1;

  if (referrer.referrals >= REQUIRED_REFERRALS) {
    referrer.unlocked = true;
  }
}

module.exports = { handleReferral };
