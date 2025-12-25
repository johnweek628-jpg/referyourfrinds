function mainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "📊 My Referrals" }],
        [{ text: "🔗 My Referral Link" }],
        [{ text: "🔓 Unlock Channel" }]
      ],
      resize_keyboard: true
    }
  };
}

module.exports = { mainKeyboard };
