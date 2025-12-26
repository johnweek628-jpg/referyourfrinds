import { getUser, createUser, confirmReferral } from './db.js';

/**
 * Confirm and count referral AFTER channel join
 */
export function handleReferral(userId) {
  const user = getUser(userId);
  if (!user) return;

  const referrerId = user.pendingReferrer;
  if (!referrerId) return;

  createUser(referrerId);

  const success = confirmReferral(userId, referrerId);
  if (!success) return;

  user.pendingReferrer = null;
}
