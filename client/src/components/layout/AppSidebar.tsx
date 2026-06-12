import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Globe,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { clientNavLinks, isNavLinkActive, managerNavLinks } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navIcons: Record<string, LucideIcon> = {
  "/dashboard": Globe,
  "/issues": Ticket,
  "/manager": BarChart3,
  "/manager/issues": ListTodo,
};

export function AppSidebar() {
  const { user } = useAuth();
  const logout = useLogout();
  const { collapsed } = useSidebar();
  const location = useLocation();
  const links = user?.role === "MANAGER" ? managerNavLinks : clientNavLinks;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border/50",
          collapsed ? "justify-center px-2" : "gap-2 px-4",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-in fade-in duration-300">
            <p className="truncate text-sm font-semibold">Issue Tracker</p>
            <p className="truncate text-xs text-sidebar-foreground/60">Pixel Future SaaS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {!collapsed && (
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            Navigation
          </p>
        )}
        {links.map((link) => {
          const Icon = navIcons[link.to] ?? LayoutDashboard;
          const active = isNavLinkActive(location.pathname, link.to, links);
          return (
            <Button
              key={link.to}
              variant="ghost"
              asChild
              title={collapsed ? link.label : undefined}
              className={cn(
                "h-10 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed ? "w-full justify-center px-0" : "w-full justify-start gap-3 px-3",
                active &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              )}
            >
              <Link to={link.to} aria-current={active ? "page" : undefined}>
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate animate-in fade-in duration-300">{link.label}</span>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className={cn("shrink-0 p-2", collapsed ? "px-2" : "p-4")}>
        <div
          className={cn(
            "rounded-lg bg-sidebar-accent/50",
            collapsed ? "flex flex-col items-center gap-2 p-2" : "p-3",
          )}
        >
          {!collapsed && (
            <>
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.role}</p>
            </>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            title="Sign out"
            className={cn(
              "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "h-9 w-9" : "mt-2 h-8 w-full justify-start gap-2 px-2",
            )}
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Sign out"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
