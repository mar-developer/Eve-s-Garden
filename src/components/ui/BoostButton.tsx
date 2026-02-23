"use client";

import { useCallback, useEffect, useState } from "react";
import { inputRef } from "../../game/stores/input-ref";

/**
 * Large boost button for mobile — right thumb.
 * Only renders on touch devices.
 */
export const BoostButton = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleDown = useCallback(() => {
    inputRef.boost = true;
  }, []);

  const handleUp = useCallback(() => {
    inputRef.boost = false;
  }, []);

  if (!isTouchDevice) return null;

  return (
    <button
      type="button"
      className="absolute bottom-8 right-8 z-20 pointer-events-auto select-none touch-none
        w-20 h-20 rounded-full bg-orange-400/70 border-4 border-white/60
        active:bg-orange-500/90 active:scale-95
        flex items-center justify-center
        text-white font-black text-lg shadow-xl"
      onTouchStart={handleDown}
      onTouchEnd={handleUp}
      onTouchCancel={handleUp}
    >
      BOOST
    </button>
  );
};
