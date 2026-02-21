"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
// Dynamically import all UI components that rely on client-side state (Zustand persist)
const HUD = dynamic(() => import("@/components/ui/HUD").then((mod) => mod.HUD), {
  ssr: false,
});
const DesignPanel = dynamic(
  () => import("@/components/ui/DesignPanel").then((mod) => mod.DesignPanel),
  { ssr: false },
);

// Dynamic import to avoid SSR issues with Three.js
const Scene = dynamic(
  () => import("@/components/three/Scene").then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center h-full"
        style={{
          background: "var(--color-bg)",
          color: "var(--color-text-dim)",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
        }}
      >
        Loading Eve&apos;s Garden...
      </div>
    ),
  },
);

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Suspense fallback={
          <div
            className="flex items-center justify-center h-full"
            style={{
              background: "var(--color-bg)",
              color: "var(--color-text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: 14,
            }}
          >
            Loading Eve&apos;s Garden...
          </div>
        }>
          <Scene />
        </Suspense>
        <HUD />
      </div>

      {/* Character Design Panel */}
      <DesignPanel />
    </div>
  );
}
