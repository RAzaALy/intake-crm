import { BrandMark } from "./BrandMark";
import { FailureIndicator } from "./FailureIndicator";
import { MainNav } from "./MainNav";
import { NewContactLink } from "./NewContactLink";
import { TopBarTitle } from "./TopBarTitle";

/**
 * Below 1024px. On phones it shows the page title; on tablets the product
 * name and the nav links, because there is no bottom tab bar there.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-bar items-center gap-4 border-b border-line bg-surface px-4 md:px-8 lg:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
        <TopBarTitle />
        <FailureIndicator />
      </div>
      <div className="hidden items-center gap-6 md:flex md:flex-1">
        <div className="flex items-center gap-2">
          <BrandMark />
          <FailureIndicator />
        </div>
        <MainNav variant="topbar" />
      </div>
      <NewContactLink placement="topbar" />
    </header>
  );
}
