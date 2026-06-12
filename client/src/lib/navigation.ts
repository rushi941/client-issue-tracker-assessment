export type NavLink = {
  to: string;
  label: string;
};

export const clientNavLinks: NavLink[] = [
  { to: "/dashboard", label: "Websites" },
  { to: "/issues", label: "My Issues" },
];

export const managerNavLinks: NavLink[] = [
  { to: "/manager", label: "Analytics" },
  { to: "/manager/issues", label: "All Issues" },
];

/** Pick the single best-matching nav item (longest path wins). */
export function getActiveNavPath(pathname: string, links: NavLink[]): string | undefined {
  const sorted = [...links].sort((a, b) => b.to.length - a.to.length);
  return sorted.find((link) => pathname === link.to || pathname.startsWith(`${link.to}/`))?.to;
}

export function isNavLinkActive(pathname: string, linkTo: string, links: NavLink[]): boolean {
  return getActiveNavPath(pathname, links) === linkTo;
}

export function getNavLabel(pathname: string, links: NavLink[]): string {
  return links.find((l) => l.to === getActiveNavPath(pathname, links))?.label ?? "Dashboard";
}

export function getNavLinksForPath(pathname: string): NavLink[] {
  return pathname.startsWith("/manager") ? managerNavLinks : clientNavLinks;
}
