import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card transition-colors ${className}`}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function CardHeader({
  title,
  action,
  icon,
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-5 pt-5 ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
