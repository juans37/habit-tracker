import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{
        background: "radial-gradient(circle at 50% 0%, #14171b 0%, #050607 55%)",
      }}
    >
      <div className="w-full max-w-sm rounded-[20px] border border-border bg-card p-7">
        <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path
              d="M12 2c-1.2 4-6 5.2-6 11a6 6 0 0012 0c0-2.1-1-3.3-2.1-4.3.4 2-1 3-2 2 .6-2-1-4.4-1.9-8.7z"
              fill="#FF8A3D"
            />
          </svg>
          <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
          <p className="text-[13px] text-ink-faint">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
