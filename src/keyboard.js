export function mainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['📊 My Referrals'],
        ['🔗 My Referral Link']
      ],
      resize_keyboard: true
    }
  };
}
