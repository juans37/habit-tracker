import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen w-full justify-center"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #14171b 0%, #050607 55%)",
      }}
    >
      <div className="relative flex min-h-screen w-full max-w-[460px] flex-col bg-surface shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        <div className="rt-scroll flex-1 overflow-y-auto px-5 pt-5 pb-6">
          {children}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
