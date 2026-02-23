"use client";

import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { inputRef } from "../../game/stores/input-ref";

/**
 * Bridges drei's useKeyboardControls into the shared inputRef.
 * On desktop, keyboard takes priority over joystick.
 * On mobile, no keyboard events fire so this is a no-op.
 */
export const KeyboardBridge = () => {
  const [, get] = useKeyboardControls();

  useFrame(() => {
    const { forward, backward, left, right, boost } = get();
    const hasKeyboard = forward || backward || left || right || boost;

    // Only write if keyboard has input (don't zero out joystick values)
    if (hasKeyboard || !inputRef.joystickActive) {
      inputRef.forward = forward;
      inputRef.backward = backward;
      inputRef.left = left;
      inputRef.right = right;
      inputRef.boost = boost;
    }
  });

  return null;
};
