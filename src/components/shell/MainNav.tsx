"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isCurrentPath } from "./navItems";

type NavVariant = "sidebar" | "topbar" | "tabs";

const listStyles: Record<NavVariant, string> = {
  sidebar: "flex flex-col gap-1",
  topbar: "flex items-center gap-1",
  tabs: "grid h-full grid-cols-2",
};

const linkStyles: Record<NavVariant, string> = {
  sidebar:
    "flex h-9 items-center gap-2 rounded-control px-3 font-medium text-ink-muted hover:bg-sunken hover:text-ink aria-[current=page]:bg-primary-soft aria-[current=page]:font-semibold aria-[current=page]:text-primary",
  topbar:
    "flex h-11 items-center rounded-control px-3 font-medium text-ink-muted hover:bg-sunken hover:text-ink aria-[current=page]:bg-primary-soft aria-[current=page]:font-semibold aria-[current=page]:text-primary",
  tabs: "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 border-t-2 border-transparent text-meta font-medium text-ink-muted aria-[current=page]:border-primary aria-[current=page]:font-semibold aria-[current=page]:text-primary",
};

type NavListProps = {
  variant: NavVariant;
  pathname: string | null;
};

function NavList({ variant, pathname }: NavListProps) {
  return (
    <nav aria-label="Main" className={variant === "tabs" ? "h-full" : undefined}>
      <ul className={listStyles[variant]}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isCurrentPath(pathname, href) ? "page" : undefined}
              className={cn(
                "transition-colors duration-150 ease-out",
                linkStyles[variant],
              )}
            >
              {variant !== "topbar" && <Icon size={16} aria-hidden="true" />}
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CurrentNavList({ variant }: { variant: NavVariant }) {
  const pathname = usePathname();
  return <NavList variant={variant} pathname={pathname} />;
}

/**
 * The shell sits above dynamic routes like /contacts/[id], where usePathname
 * suspends during prerendering. The fallback renders the same links without
 * a current item, so the build never fails and the layout never jumps.
 */
export function MainNav({ variant }: { variant: NavVariant }) {
  return (
    <Suspense fallback={<NavList variant={variant} pathname={null} />}>
      <CurrentNavList variant={variant} />
    </Suspense>
  );
}
