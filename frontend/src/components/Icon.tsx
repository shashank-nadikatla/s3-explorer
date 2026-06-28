import type { CSSProperties } from "react";

interface IconProps {
  name: string;
  className?: string;
  style?: CSSProperties;
  size?: number;
}

export function Icon({ name, className = "", style, size }: IconProps) {
  return (
    <span
      className={`sym ${className}`}
      style={{ ...style, ...(size ? { fontSize: size } : {}) }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
