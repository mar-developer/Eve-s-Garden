"use client";

import { Suspense } from "react";
import LetterCrashScene from "@/components/three/LetterCrashScene";
import { Overlay } from "@/components/ui/Overlay";

export default function LetterCrashPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black touch-none">
      {/* 3D Scene */}
      <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading Sky Islands...</div>}>
         <LetterCrashScene />
      </Suspense>

      {/* UI Overlay */}
      <Overlay />
    </main>
  );
}
