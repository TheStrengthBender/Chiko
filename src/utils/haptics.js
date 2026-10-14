// Spider-Verse Tactile Haptic Feedback
export const triggerHaptic = (type = 'tick') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) return;
  try {
    if (type === 'tick') {
      // Sharp, quick tick for navigating menus and tapping tabs
      window.navigator.vibrate(12);
    } else if (type === 'thud') {
      // Heavy comic impact thud for selecting weeks / KAPOW burst
      window.navigator.vibrate(36);
    } else if (type === 'burst') {
      // Stutter-step heavy thud burst for completing exercise sets
      window.navigator.vibrate([22, 16, 48]);
    }
  } catch {
    // Graceful fallback for non-supporting browsers
  }
};
