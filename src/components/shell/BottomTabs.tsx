import { MainNav } from "./MainNav";

/** Phones only (under 768px). */
export function BottomTabs() {
  return (
    // Safe-area padding keeps the labels clear of the iPhone home indicator.
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="h-bar">
        <MainNav variant="tabs" />
      </div>
    </div>
  );
}
