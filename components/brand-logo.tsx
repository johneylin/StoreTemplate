import { STORE_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
  theme?: "light" | "dark";
};

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  showWordmark = true,
  theme = "light",
}: BrandLogoProps) {
  const wordmarkColor = theme === "dark" ? "text-slate-950" : "text-white";
  const accentColor = theme === "dark" ? "text-amber-700" : "text-amber-300";

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={cn("h-11 w-11 shrink-0", markClassName)}
      >
        <defs>
          <linearGradient id="jp-logo-gradient" x1="8" x2="56" y1="6" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbbf24" />
            <stop offset="1" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="20" fill="url(#jp-logo-gradient)" />
        <path
          d="M22 18h18v6H28v14c0 6-3 10-9 10h-3v-6h2c3 0 4-2 4-4V18Z"
          fill="#0f172a"
        />
        <path
          d="M40 18c6.5 0 11 4 11 10 0 5.9-4.5 9.9-11 9.9h-4.4V46H29V18h11Zm-.2 14.1c3.3 0 5-1.6 5-4.1s-1.7-4.1-5-4.1h-4.2v8.2h4.2Z"
          fill="#fffaf0"
        />
        <path
          d="M14 49c7.2-8.7 18.4-10.2 33.6-4.4"
          fill="none"
          stroke="#fffaf0"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
      {showWordmark ? (
        <div className={cn("leading-none", textClassName)}>
          <span className={cn("block font-display text-2xl font-semibold tracking-tight", wordmarkColor)}>{STORE_NAME}</span>
          <span className={cn("block text-[0.68rem] font-semibold uppercase tracking-[0.34em]", accentColor)}>
            Curated pickup shop
          </span>
        </div>
      ) : null}
    </div>
  );
}
