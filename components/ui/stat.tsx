import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
  className?: string;
}

export function Stat({ label, value, sub, accent, className }: StatProps) {
  return (
    <div
      className={cn("px-3.5 py-2.5 min-w-0", className)}
      style={{ borderRight: "0.5px solid var(--bd)" }}
    >
      <div
        className="text-[10px] font-medium uppercase tracking-[0.08em]"
        style={{ color: "var(--mut)", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div
        className="text-2xl font-semibold tracking-[-0.02em] mt-1 tabular-nums"
        style={{ color: accent ? "var(--acc)" : "var(--ink)" }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="text-[11px] mt-0.5"
          style={{ color: "var(--mut)", fontFamily: "var(--font-mono)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
