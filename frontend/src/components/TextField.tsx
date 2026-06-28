import type { InputHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  icon?: string;
  trailing?: string;
  onTrailingClick?: () => void;
  type?: string;
  supporting?: string;
  error?: string;
}

export function TextField({
  label,
  icon,
  trailing,
  onTrailingClick,
  type = "text",
  supporting,
  error,
  className = "",
  ...rest
}: TextFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="group block">
        <div
          className={`relative flex h-14 items-center gap-3 rounded-t-lg px-4 bg-surface-container-highest focus-within:ring-2 focus-within:ring-primary border-b border-on-surface-variant ${error ? "ring-2 ring-error" : ""}`}
        >
          {icon && <Icon name={icon} size={20} className="text-on-surface-variant" />}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-muted-foreground group-focus-within:text-primary">
              {label}
            </div>
            <input
              type={type}
              {...rest}
              className="w-full truncate bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          {trailing && (
            <button
              type="button"
              onClick={onTrailingClick}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-container"
            >
              <Icon name={trailing} size={20} className="text-on-surface-variant" />
            </button>
          )}
        </div>
      </label>
      {(supporting || error) && (
        <div className={`px-4 text-[11px] ${error ? "text-error" : "text-muted-foreground"}`}>
          {error || supporting}
        </div>
      )}
    </div>
  );
}
