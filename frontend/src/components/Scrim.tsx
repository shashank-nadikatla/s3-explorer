import type { ReactNode } from "react";

interface ScrimProps {
  children: ReactNode;
  onClose?: () => void;
}

export function Scrim({ children, onClose }: ScrimProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full grid place-items-center">{children}</div>
    </div>
  );
}
