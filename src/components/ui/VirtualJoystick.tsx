"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { inputRef } from "../../game/stores/input-ref";

const JOYSTICK_SIZE = 140;
const KNOB_SIZE = 60;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

/**
 * Custom virtual joystick for mobile/touch devices.
 * Writes normalized direction into `inputRef` for Car.tsx to consume.
 * Only renders on devices with touch support.
 */
export const VirtualJoystick = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, MAX_DISTANCE);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
    }

    // Normalize to -1..1
    const normX = clampedDist > 5 ? knobX / MAX_DISTANCE : 0;
    const normY = clampedDist > 5 ? -knobY / MAX_DISTANCE : 0; // Invert Y: up = forward

    inputRef.joystickX = normX;
    inputRef.joystickY = normY;
    inputRef.joystickActive = clampedDist > 5;

    // Map to boolean directions for compatibility
    const deadzone = 0.25;
    inputRef.forward = normY > deadzone;
    inputRef.backward = normY < -deadzone;
    inputRef.left = normX < -deadzone;
    inputRef.right = normX > deadzone;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (activeTouch.current !== null) return;
      const touch = e.changedTouches[0];
      activeTouch.current = touch.identifier;

      const base = baseRef.current;
      if (base) {
        const rect = base.getBoundingClientRect();
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      updateKnob(touch.clientX, touch.clientY);
    },
    [updateKnob],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouch.current) {
          updateKnob(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [updateKnob],
  );

  const resetJoystick = useCallback(() => {
    activeTouch.current = null;
    if (knobRef.current) {
      knobRef.current.style.transform = "translate(0px, 0px)";
    }
    inputRef.joystickX = 0;
    inputRef.joystickY = 0;
    inputRef.joystickActive = false;
    inputRef.forward = false;
    inputRef.backward = false;
    inputRef.left = false;
    inputRef.right = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouch.current) {
          resetJoystick();
          break;
        }
      }
    },
    [resetJoystick],
  );

  if (!isTouchDevice) return null;

  return (
    <div
      className="absolute bottom-8 left-8 z-20 pointer-events-auto select-none touch-none"
      style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
    >
      <div
        ref={baseRef}
        className="relative w-full h-full rounded-full bg-black/20 border-2 border-white/30"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute rounded-full bg-white/60 border-2 border-white/80 shadow-lg"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            top: (JOYSTICK_SIZE - KNOB_SIZE) / 2,
            left: (JOYSTICK_SIZE - KNOB_SIZE) / 2,
            transition: activeTouch.current !== null ? "none" : "transform 0.15s ease-out",
          }}
        />
      </div>
    </div>
  );
};
