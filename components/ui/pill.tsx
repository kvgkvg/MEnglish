import { cn } from "@/lib/utils";

type PillTone = "mut" | "accent" | "good" | "bad" | "warn";
type PillSize = "xs" | "sm";

interface PillProps {
  children: React.ReactNode;
  tone?: PillTone;
  size?: PillSize;
  className?: string;
}

const toneMap: Record<PillTone, { bg: string; color: string; border: string }> = {
  mut: {
    bg: "var(--mut2)",
    color: "var(--mut)",
    border: "var(--bd)",
  },
  accent: {
    bg: "color-mix(in oklch, var(--acc) 12%, var(--bg))",
    color: "var(--acc)",
    border: "color-mix(in oklch, var(--acc) 30%, var(--bg))",
  },
  good: {
    bg: "color-mix(in oklch, var(--good) 12%, var(--bg))",
    color: "var(--good)",
    border: "color-mix(in oklch, var(--good) 30%, var(--bg))",
  },
  bad: {
    bg: "color-mix(in oklch, var(--bad) 10%, var(--bg))",
    color: "var(--bad)",
    border: "color-mix(in oklch, var(--bad) 30%, var(--bg))",
  },
  warn: {
    bg: "color-mix(in oklch, var(--warn) 12%, var(--bg))",
    color: "var(--warn)",
    border: "color-mix(in oklch, var(--warn) 30%, var(--bg))",
  },
};

export function Pill({ children, tone = "mut", size = "sm", className }: PillProps) {
  const t = toneMap[tone];
  return (
    <span
      className={cn("inline-flex items-center leading-[1.4] font-medium", className)}
      style={{
        padding: size === "xs" ? "1px 6px" : "2px 8px",
        borderRadius: 3,
        background: t.bg,
        color: t.color,
        border: `0.5px solid ${t.border}`,
        fontSize: size === "xs" ? 10 : 11,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}
