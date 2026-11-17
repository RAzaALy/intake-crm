import type { ReactNode } from "react";
import { BottomTabs } from "./BottomTabs";
import { DemoSwitch } from "./DemoSwitch";
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
      {/* fill-page (globals.css): on the list and the board, from 768px, the shell is exactly one
          screen tall and main hands its height down, so the table or board scrolls instead of the page.
          Phones keep the normal page scroll: a nested scroller there fights the bottom tabs. */}
      <div className="min-h-dvh lg:flex md:fill-page:flex md:fill-page:h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          {/* tabIndex -1 lets the skip link move focus here. */}
          <main
            id="main"
            tabIndex={-1}
            className="flex-1 px-4 pt-6 pb-8 outline-none md:px-8 lg:pt-8 md:fill-page:flex md:fill-page:min-h-0 md:fill-page:flex-col md:fill-page:pb-6"
          >
            <div className="mx-auto w-full max-w-content md:fill-page:flex md:fill-page:min-h-0 md:fill-page:flex-1 md:fill-page:flex-col">
              {children}
            </div>
          </main>
          {/* Below 1024px the demo switch ends each page; on desktop it sits in the sidebar.
              A div, not <footer>: a footer landmark holding only a switch is noise for screen readers. */}
          <div className="border-t border-line px-4 pt-4 pb-[calc(var(--spacing-bar)+env(safe-area-inset-bottom)+24px)] md:px-8 md:pb-8 lg:hidden">
            <div className="mx-auto w-full max-w-content">
              <DemoSwitch />
            </div>
          </div>
        </div>
      </div>
      <BottomTabs />
    </>
  );
}
