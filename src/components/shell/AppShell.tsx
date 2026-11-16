import type { ReactNode } from "react";
import { BottomTabs } from "./BottomTabs";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-3 focus:py-2 focus:shadow-float"
      >
        Skip to main content
      </a>
      <div className="min-h-dvh lg:flex">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          {/* tabIndex -1 lets the skip link move focus here. */}
          <main
            id="main"
            tabIndex={-1}
            className="flex-1 px-4 pt-6 pb-[calc(var(--spacing-bar)+env(safe-area-inset-bottom)+24px)] outline-none md:px-8 md:pb-8 lg:pt-8"
          >
            <div className="mx-auto w-full max-w-content">{children}</div>
          </main>
        </div>
      </div>
      <BottomTabs />
    </>
  );
}
