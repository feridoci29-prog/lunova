import { BrandLogo, type LogoSize } from "@/components/brand/BrandLogo";

export interface BrandProps {
  className?: string;
  compact?: boolean;
  size?: LogoSize;
  interactive?: boolean;
}

/**
 * Global Brand component replaced with transparent balloon-letter logo (LENOVA).
 * Supports size ("sm" | "md" | "lg"), interactive mixed-variant shuffle, and dark/light shadow.
 */
export function Brand({ className, compact = false, size, interactive = true }: BrandProps) {
  const chosenSize: LogoSize = size ?? (compact ? "sm" : "md");
  return (
    <BrandLogo
      size={chosenSize}
      interactive={interactive}
      className={className}
    />
  );
}

// Keep legacy SVG marks exported for backward compatibility if imported by tests
export function DraftMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 36" className={className} fill="none" aria-hidden="true">
      <path d="M3 2h18l9 9v15c0 5-4 8-9 8H3V2Z" fill="#91B8FF" />
      <path d="M21 2v9h9" fill="#c9dbff" />
      <path
        d="M3 33 14 23c5 1 8-2 8-7V3"
        stroke="#0B0E14"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MoonO({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M15.5 4.2a8.6 8.6 0 0 1 0 15.6a7.2 7.2 0 0 0 0-15.6z"
        fill="var(--ice)"
        opacity="0.9"
      />
    </svg>
  );
}
