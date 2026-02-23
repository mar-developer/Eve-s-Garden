/**
 * Haptic feedback wrappers using the Vibration API.
 * Each function is a no-op when the API is unavailable (SSR, desktop browsers).
 */

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/** Short tap — block collision */
export function vibrateHit(): void {
  if (canVibrate()) navigator.vibrate(50);
}

/** Warp pattern — dimension portal */
export function vibrateWarp(): void {
  if (canVibrate()) navigator.vibrate([100, 50, 200]);
}

/** Celebration pattern — ALL CLEAR */
export function vibrateCelebrate(): void {
  if (canVibrate()) navigator.vibrate([50, 30, 50, 30, 200]);
}
