/**
 * Keyboard shown to NEW users
 * Forces them to:
 * 1) Join the channel
 * 2) Come back and confirm
 */
export function joinConfirmKeyboard(channelUsername) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📢 Join the channel',
            url: `https://t.me/${channelUsername}`
          }
        ],
        [
          {
            text: '✅ Confirm',
            callback_data: 'confirm_join'
          }
        ]
      ]
    }
  };
}

/**
 * Keyboard shown AFTER confirmation
 */
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
