function mainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "📊 My Referrals" }],
        [{ text: "🔗 My Referral Link" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
      selective: true
    }
  };
}

module.exports = { mainKeyboard };
