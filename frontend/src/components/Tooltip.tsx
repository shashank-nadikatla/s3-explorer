import { useState, type ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex w-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div className="absolute right-0 bottom-full mb-1 z-50 px-3 py-1.5 rounded-lg bg-inverse-surface text-inverse-on-surface text-xs font-normal whitespace-nowrap shadow-elev-3 pointer-events-none">
          {text}
        </div>
      )}
    </div>
  );
}
