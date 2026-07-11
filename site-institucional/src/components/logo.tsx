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
      {/* Premium car badge */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Badge background */}
        <rect x="1" y="1" width="46" height="46" rx="12" fill="#0d0d10" stroke="#10b981" strokeWidth="1.5" />

        {/* Car body */}
        <path d="
          M 6,30
          L 6,26
          Q 6,20 10,18
          L 14,12
          Q 16,8 24,8
          Q 32,8 36,12
          L 42,18
          Q 44,20 44,26
          L 44,30
          L 42,30
          Q 36,22 30,30
          L 22,30
          Q 16,22 10,30
          Z
        " fill="#10b981" />

        {/* Windows */}
        <path d="
          M 16,14
          Q 18,11 24,11
          Q 30,11 34,14
          L 30,16
          L 22,16
          Z
        " fill="#060608" opacity="0.5" />

        {/* Rear window divider */}
        <line x1="22" y1="11" x2="22" y2="16" stroke="#060608" strokeWidth="1" opacity="0.5" />

        {/* Wheels */}
        <circle cx="14" cy="34" r="6" fill="#060608" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="14" cy="34" r="2" fill="#10b981" opacity="0.6" />
        <circle cx="36" cy="34" r="6" fill="#060608" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="36" cy="34" r="2" fill="#10b981" opacity="0.6" />

        {/* Road line accent */}
        <line x1="8" y1="42" x2="40" y2="42" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
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
