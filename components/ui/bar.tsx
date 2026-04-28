interface BarProps {
  value: number;
  max?: number;
  height?: number;
  color?: string;
}

export function Bar({ value, max = 1, height = 4, color = "var(--acc)" }: BarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      style={{
        height,
        background: "var(--mut2)",
        borderRadius: height / 2,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          transition: "width .25s",
        }}
      />
    </div>
  );
}
