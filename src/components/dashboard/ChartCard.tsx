import { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 flex flex-col ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}