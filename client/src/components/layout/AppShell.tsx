import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "./NotificationBell";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { getNavLabel, getNavLinksForPath } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AppShellInner({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { collapsed, toggle } = useSidebar();
  const links = getNavLinksForPath(location.pathname);
  const pageTitle = getNavLabel(location.pathname, links);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-300 ease-in-out",
          collapsed ? "pl-[4.5rem]" : "pl-64",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="shrink-0"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{pageTitle}</h2>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Client Issue Tracker
              </p>
            </div>
          </div>
          <NotificationBell />
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
