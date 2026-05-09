import * as React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 28, className, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-label="PoC disaster prevention Chat logo"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path
        d="M32 4 L56 12 V30 C56 44 46 54 32 60 C18 54 8 44 8 30 V12 Z"
        fill="url(#logoGradient)"
      />
      <path
        d="M22 24 H42 C44.2 24 46 25.8 46 28 V36 C46 38.2 44.2 40 42 40 H32 L26 46 V40 H22 C19.8 40 18 38.2 18 36 V28 C18 25.8 19.8 24 22 24 Z"
        fill="white"
      />
      <path d="M30 27 L26 34 H30 L28 39 L34 32 H30 Z" fill="#f59e0b" />
    </svg>
  );
}
