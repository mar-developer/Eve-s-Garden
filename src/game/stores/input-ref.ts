/**
 * Module-level mutable ref for shared input state.
 * Both keyboard (via useKeyboardControls) and virtual joystick write here.
 * Car.tsx reads from here each frame instead of reading keyboard directly.
 *
 * This avoids putting per-frame input data in a reactive store.
 */
export const inputRef = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  boost: false,

  /** Joystick analog values (0-1). Takes priority over boolean when non-zero. */
  joystickX: 0,
  joystickY: 0,
  joystickActive: false,
};

/** Returns true if any movement input is active. */
export function isAnyMovement(): boolean {
  return (
    inputRef.forward ||
    inputRef.backward ||
    inputRef.left ||
    inputRef.right ||
    inputRef.joystickActive
  );
}
