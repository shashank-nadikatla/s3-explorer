import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";

export type BtnVariant = "filled" | "tonal" | "outlined" | "text" | "elevated" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  icon?: string;
  trailing?: string;
  full?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<BtnVariant, string> = {
  filled: "bg-primary text-primary-foreground hover:shadow-elev-2",
  tonal: "bg-secondary-container text-on-secondary-container hover:shadow-elev-1",
  outlined: "border border-outline text-primary bg-transparent hover:bg-primary/5",
  text: "text-primary bg-transparent hover:bg-primary/5",
  elevated: "bg-surface-container-low text-primary shadow-elev-1",
  destructive: "bg-error text-primary-foreground hover:shadow-elev-2",
};

export function Button({
  children,
  variant = "filled",
  icon,
  trailing,
  full,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${full ? "w-full" : ""} ${className}`}
    >
      {icon && <Icon name={icon} size={18} />}
      {children && <span>{children}</span>}
      {trailing && <Icon name={trailing} size={18} />}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  size?: number;
}

export function IconButton({ icon, size = 40, className = "", ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      style={{ height: size, width: size }}
      className={`grid place-items-center rounded-full hover:bg-surface-container transition-colors ${className}`}
    >
      <Icon name={icon} size={size * 0.5} />
    </button>
  );
}
