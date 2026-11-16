import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { BrandMark } from "./BrandMark";
import { MainNav } from "./MainNav";

/** Desktop only (1024px and up). */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-sidebar shrink-0 flex-col gap-6 border-r border-line bg-surface px-3 pt-8 pb-5 lg:flex">
      <div className="px-3">
        <BrandMark />
      </div>
      <MainNav variant="sidebar" />
      <Link href="/contacts/new" className={buttonStyles({ className: "w-full" })}>
        New contact
      </Link>
    </aside>
  );
}
