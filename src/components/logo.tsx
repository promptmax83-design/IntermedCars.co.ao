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
      {/* IC Monogram */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="10" fill="#10b981" />
        <path d="M14 12h4v24h-4V12z" fill="#ffffff" />
        <path
          d="M34 12c-2.2 0-4.2.9-5.7 2.3l2.1 2.1c1-1 2.4-1.6 3.6-1.6 2.8 0 5 2.2 5 5s-2.2 5-5 5c-1.2 0-2.6-.6-3.6-1.6l-2.1 2.1C29.8 27.1 31.8 28 34 28c5 0 9-4 9-9s-4-9-9-9z"
          fill="#ffffff"
          opacity="0.9"
        />
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex items-baseline">
          <span className={`font-bold ${s.text} text-[#fafafa]`}>Intermed</span>
          <span className={`font-bold ${s.text} text-[#10b981]`}>Cars</span>
        </div>
      )}
    </div>
  );
}
