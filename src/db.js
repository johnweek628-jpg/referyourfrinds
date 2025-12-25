const users = new Map();

function getUser(userId) {
  if (!users.has(userId)) {
    users.set(userId, {
      referrals: 0,
      referredBy: null,
      unlocked: false
    });
  }
  return users.get(userId);
}

module.exports = { users, getUser };
