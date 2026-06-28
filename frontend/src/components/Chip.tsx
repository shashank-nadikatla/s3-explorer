import type { ReactNode } from "react";
import { Icon } from "./Icon";

export type ChipTone = "neutral" | "primary" | "secondary" | "tertiary" | "error";

interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

const toneStyles: Record<ChipTone, string> = {
  neutral: "bg-surface-container-high text-on-surface-variant",
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  error: "bg-error-container text-on-error-container",
};

export function Chip({ children, tone = "neutral", icon, onClick, className = "" }: ChipProps) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${toneStyles[tone]} ${onClick ? "hover:opacity-90 cursor-pointer" : ""} ${className}`}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </Comp>
  );
}
