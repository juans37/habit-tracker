"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/today", label: "Today" },
  { href: "/habits", label: "Habits" },
  { href: "/stats", label: "Stats" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex border-t border-border bg-surface px-3 pt-2.5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 py-1.5 text-[11.5px] font-bold ${
              active ? "text-ink" : "text-ink-faint"
            }`}
          >
            <span
              className="h-[5px] w-[5px] rounded-full"
              style={{ background: active ? "#FF8A3D" : "transparent" }}
            />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
