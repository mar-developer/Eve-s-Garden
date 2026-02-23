"use client";

import { WordInput } from "./WordInput";
import { LetterHUD } from "./LetterHUD";
import { SpeechBubble } from "./SpeechBubble";
import { VirtualJoystick } from "./VirtualJoystick";
import { BoostButton } from "./BoostButton";
import { BuildModePanel } from "./BuildModePanel";
import { PhotoModeUI } from "./PhotoModeUI";
import { MiniGameHUD } from "./MiniGameHUD";
import { ParentDashboard } from "./ParentDashboard";

export const Overlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
      {/* 
        pointer-events-none on the container allows clicks to pass through to the 3D canvas 
        We re-enable pointer-events-auto on interactive children
      */}
      
      <div className="pointer-events-auto">
        <LetterHUD />
      </div>

      <SpeechBubble />

      <div className="pointer-events-auto">
        <WordInput />
      </div>

      {/* Build mode panel (slides in from right) */}
      <BuildModePanel />

      {/* Photo mode overlay */}
      <PhotoModeUI />

      {/* Mini-game HUD (timer, score) */}
      <MiniGameHUD />

      {/* Parent dashboard (PIN-gated settings) */}
      <ParentDashboard />

      {/* Mobile touch controls — only rendered on touch devices */}
      <VirtualJoystick />
      <BoostButton />

      {/* WASD/Shift Controls Hint - Bottom Right (hidden on touch devices via CSS) */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2 text-white/50 font-black text-xl tracking-widest pointer-events-none select-none max-sm:hidden">
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded-xl bg-black/20 border-2 border-white/20 flex items-center justify-center shadow-lg">W</div>
        </div>
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded-xl bg-black/20 border-2 border-white/20 flex items-center justify-center shadow-lg">A</div>
          <div className="w-12 h-12 rounded-xl bg-black/20 border-2 border-white/20 flex items-center justify-center shadow-lg">S</div>
          <div className="w-12 h-12 rounded-xl bg-black/20 border-2 border-white/20 flex items-center justify-center shadow-lg">D</div>
        </div>
        <div className="mt-2 text-sm uppercase tracking-widest bg-black/20 px-4 py-2 rounded-lg border-2 border-white/20 shadow-lg flex items-center gap-2">
          <span className="w-16 text-center font-bold bg-white/10 rounded">SHIFT</span> + BOOST
        </div>
      </div>
    </div>
  );
};
