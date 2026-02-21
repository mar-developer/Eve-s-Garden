"use client";

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
  size?: number;
  locked?: boolean;
}

export function ColorSwatch({
  color,
  selected,
  onClick,
  size = 28,
  locked = false,
}: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className="transition-all duration-150 outline-none relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: color,
        border: selected
          ? "2px solid var(--color-accent-glow)"
          : "2px solid transparent",
        cursor: "pointer",
        boxShadow: selected ? "0 0 10px rgba(167, 139, 250, 0.33)" : "none",
        transform: selected ? "scale(1.1)" : "scale(1)",
        opacity: locked ? 0.6 : 1,
      }}
    >
      {locked && (
        <span className="text-[10px] text-white drop-shadow-md">🔒</span>
      )}
    </button>
  );
}
