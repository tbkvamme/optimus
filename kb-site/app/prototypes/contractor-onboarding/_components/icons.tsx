import type { SVGProps } from 'react';

export function GaugeDot({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block w-1.5 h-1.5 rounded-full bg-brand-accent ${className}`}
    />
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
      {...props}
    >
      <path d="M3.5 8h9" />
      <path d="M9 4.5l3.5 3.5L9 11.5" />
    </svg>
  );
}

export function ArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
      {...props}
    >
      <path d="M12.5 8h-9" />
      <path d="M7 4.5L3.5 8 7 11.5" />
    </svg>
  );
}

export function CheckGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      className={className}
      aria-hidden
    >
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

export function LockGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      className={className}
      aria-hidden
    >
      <rect x="3.5" y="7" width="9" height="6" rx="1.2" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
    </svg>
  );
}

export function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      className={className}
      aria-hidden
    >
      <path d="M4 6.5l4 4 4-4" />
    </svg>
  );
}

export function PlusGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      width="14"
      height="14"
      className={className}
      aria-hidden
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function CopyGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      className={className}
      aria-hidden
    >
      <rect x="5" y="5" width="8.5" height="8.5" rx="1.2" />
      <path d="M3.5 10.5V3.5A1 1 0 014.5 2.5h7" />
    </svg>
  );
}

export function CountryFlag({ country }: { country: 'US' | 'CA' }) {
  if (country === 'US') {
    return (
      <svg
        viewBox="0 0 24 16"
        width="20"
        height="14"
        aria-label="United States"
        className="rounded-[2px] overflow-hidden block"
      >
        <rect width="24" height="16" fill="#F5F5F1" />
        <g fill="#B22234">
          <rect y="1.6" width="24" height="1.4" />
          <rect y="4.6" width="24" height="1.4" />
          <rect y="7.6" width="24" height="1.4" />
          <rect y="10.6" width="24" height="1.4" />
          <rect y="13.6" width="24" height="1.4" />
        </g>
        <rect width="10" height="8.4" fill="#3C3B6E" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 16"
      width="20"
      height="14"
      aria-label="Canada"
      className="rounded-[2px] overflow-hidden block"
    >
      <rect width="24" height="16" fill="#F5F5F1" />
      <rect width="6" height="16" fill="#D52B1E" />
      <rect x="18" width="6" height="16" fill="#D52B1E" />
      <path
        d="M12 4.2l-0.6 1.4-1.5-0.4 0.5 1.5-1.4 0.7 1.4 0.7-0.5 1.5 1.5-0.4L12 10.4l0.6-1.2 1.5 0.4-0.5-1.5 1.4-0.7-1.4-0.7 0.5-1.5-1.5 0.4z"
        fill="#D52B1E"
      />
      <rect x="11.7" y="9.5" width="0.6" height="2.5" fill="#D52B1E" />
    </svg>
  );
}

export function ClipboardGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      className={className}
      aria-hidden
    >
      <rect x="6" y="5" width="12" height="15" rx="1.5" />
      <path d="M9 5V3.5h6V5" />
      <path d="M9 11h6M9 14h6M9 17h4" />
    </svg>
  );
}

export function HandshakeGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      className={className}
      aria-hidden
    >
      <path d="M3 12l3-1 3 3 4-3 4 3 4-3" />
      <path d="M9 14l3 3 3-3" />
      <path d="M3 12V8l4-2 5 1 5-1 4 2v4" />
    </svg>
  );
}

export function KeyGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      className={className}
      aria-hidden
    >
      <circle cx="8" cy="14" r="3.5" />
      <path d="M11 12l9-9M16 7l2 2M14 9l1.5 1.5" />
    </svg>
  );
}

export function ChequeIllustration() {
  return (
    <svg
      viewBox="0 0 220 110"
      width="200"
      height="100"
      aria-hidden
      className="block"
    >
      <defs>
        <linearGradient id="chequeBg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAF9" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="216"
        height="106"
        rx="6"
        fill="url(#chequeBg)"
        stroke="#E7E5E4"
        strokeWidth="1.2"
      />
      <text
        x="14"
        y="22"
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        fill="#94A3B8"
        letterSpacing="0.5"
      >
        VOID
      </text>
      <line x1="14" y1="40" x2="206" y2="40" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="14" y1="56" x2="160" y2="56" stroke="#E7E5E4" strokeWidth="1" />
      <line x1="14" y1="72" x2="120" y2="72" stroke="#E7E5E4" strokeWidth="1" />
      <text
        x="14"
        y="96"
        fontFamily="ui-monospace, monospace"
        fontSize="11"
        fill="#0F172A"
        letterSpacing="2"
      >
        ⑆123456789⑆ ‖ 0042331298‖
      </text>
      <text
        x="170"
        y="22"
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        fill="#94A3B8"
      >
        0042
      </text>
      <text
        x="60"
        y="60"
        fontFamily="ui-sans-serif, sans-serif"
        fontSize="22"
        fontWeight="500"
        fill="#0F172A"
        opacity="0.08"
        transform="rotate(-12 110 55)"
      >
        VOID
      </text>
    </svg>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
