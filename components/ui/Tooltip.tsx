"use client";

import { useLayoutEffect, useRef, useState } from "react";

function Tooltip({
  text,
  children,
  placement = "top",
}: {
  text: string;
  children: React.ReactNode;
  placement?: "top" | "bottom";
}) {
  const [visible, setVisible] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tipRect = tipRef.current.getBoundingClientRect();
    setOverflowing(triggerRect.right + tipRect.width > window.innerWidth);
  }, [visible, text]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={triggerRef}
    >
      {children}
      {visible && (
        <div
          ref={tipRef}
          className={`pointer-events-none absolute z-[100] whitespace-nowrap rounded-md px-3 py-1.5 bg-[#1A1D1E] text-[#FFFFFF] text-xs font-medium shadow-md dark:bg-[#E4E6EB] dark:text-[#111111] border border-[#E6E8EB]/10 dark:border-[#2D2D2D]/10 ${
            placement === "bottom"
              ? "top-full mt-2"
              : "bottom-full mb-2"
          } ${
            overflowing ? "right-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          <span
            className={`absolute h-1.5 w-1.5 rotate-45 bg-[#1A1D1E] dark:bg-[#E4E6EB] ${
              placement === "bottom"
                ? overflowing
                  ? "right-3 top-0 -translate-y-1/2"
                  : "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
                : overflowing
                  ? "right-3 bottom-0 translate-y-1/2"
                  : "left-1/2 bottom-0 translate-x-1/2 translate-y-1/2"
            }`}
            style={
              placement === "bottom"
                ? overflowing
                  ? { right: 12, top: 0 }
                  : { left: "50%", top: 0, marginLeft: -3 }
                : overflowing
                  ? { right: 12, bottom: -3 }
                  : { left: "50%", bottom: -3, marginLeft: -3 }
            }
          />
          {text}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
