import { Columns3, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Columns3 },
];

/** A section is current for its own path and anything below it (/contacts/123). */
export function isCurrentPath(pathname: string | null, href: string): boolean {
  if (pathname === null) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const EXACT_TITLES: Record<string, string> = {
  "/contacts": "Contacts",
  "/contacts/new": "New contact",
  "/pipeline": "Pipeline",
};

/**
 * Title for the mobile top bar. It mirrors the page's h1, which is hidden on
 * phones. Only exact matches: on a contact page or a 404 a parent label
 * ("Contacts") would contradict the real h1, so those show the product name.
 */
export function titleForPath(pathname: string | null): string {
  if (pathname === null) return "Intake";
  return EXACT_TITLES[pathname] ?? "Intake";
}
