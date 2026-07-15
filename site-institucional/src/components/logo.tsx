interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-xs", gap: "gap-2" },
    md: { icon: 36, text: "text-sm", gap: "gap-2.5" },
    lg: { icon: 48, text: "text-lg", gap: "gap-3" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap}`}>
      {/* Premium shield + car icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield shape */}
        <path
          d="M24 2L6 10V22C6 34.36 13.8 45.72 24 48C34.2 45.72 42 34.36 42 22V10L24 2Z"
          fill="url(#shield-gradient)"
          stroke="url(#border-gradient)"
          strokeWidth="1"
        />

        {/* Inner shield highlight */}
        <path
          d="M24 5L9 12V22C9 32.9 15.7 42.78 24 45C32.3 42.78 39 32.9 39 22V12L24 5Z"
          fill="#0a0a0c"
          opacity="0.8"
        />

        {/* Stylized car silhouette */}
        <path
          d="M11 26L13 22Q14 19 17 18L20 16Q22 14 24 14Q26 14 28 16L31 18Q34 19 35 22L37 26L39 26Q36 21 33 26L28 26Q25 22 22 26L17 26Q14 22 11 26Z"
          fill="url(#car-gradient)"
        />

        {/* Windshield */}
        <path
          d="M19 17Q21 15 24 15Q27 15 29 17L27 18.5L21 18.5Z"
          fill="#10b981"
          opacity="0.4"
        />

        {/* Wheels */}
        <circle cx="16" cy="30" r="4" fill="#0a0a0c" stroke="#c9a84c" strokeWidth="1.5" />
        <circle cx="16" cy="30" r="1.5" fill="#c9a84c" opacity="0.8" />
        <circle cx="32" cy="30" r="4" fill="#0a0a0c" stroke="#c9a84c" strokeWidth="1.5" />
        <circle cx="32" cy="30" r="1.5" fill="#c9a84c" opacity="0.8" />

        {/* Road line */}
        <line x1="12" y1="36" x2="36" y2="36" stroke="#10b981" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

        {/* Gradients */}
        <defs>
          <linearGradient id="shield-gradient" x1="6" y1="2" x2="42" y2="48">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="border-gradient" x1="6" y1="2" x2="42" y2="48">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#c9a84c" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="car-gradient" x1="11" y1="14" x2="39" y2="30">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea573" />
          </linearGradient>
        </defs>
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex items-baseline">
          <span className={`font-bold ${s.text} text-[#fafafa] tracking-tight`}>Intermed</span>
          <span className={`font-bold ${s.text} text-[#c9a84c] tracking-tight`}>Cars</span>
        </div>
      )}
    </div>
  );
}
