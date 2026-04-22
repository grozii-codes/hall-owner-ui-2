import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Bell, Calendar, Home, Building2, Users, BarChart3, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NotificationsSheet from "./NotificationsSheet";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/bookings", icon: Calendar, label: "Bookings" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/halls", icon: Building2, label: "Halls" },
  { to: "/customers", icon: Users, label: "Customers" },
];

const desktopNav = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/bookings", icon: Calendar, label: "Bookings" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/halls", icon: Building2, label: "My Halls" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function AppLayout() {
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const titleMap: Record<string, string> = {
    "/": "Dashboard",
    "/bookings": "Bookings",
    "/calendar": "Calendar",
    "/halls": "My Halls",
    "/customers": "Customers",
    "/analytics": "Analytics",
  };
  const title = titleMap[location.pathname] || "VenueHub";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold text-base">VenueHub</div>
            <div className="text-[11px] text-sidebar-foreground/60">Owner Dashboard</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {desktopNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-accent flex items-center justify-center font-display font-bold text-accent-foreground">
              K
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Kareem Owner</div>
              <div className="text-xs text-sidebar-foreground/60 truncate">+91 72193 66167</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-14 lg:h-16">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display font-bold text-[15px] leading-none">VenueHub</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Owner</div>
              </div>
            </div>
            <h1 className="hidden lg:block font-display font-bold text-xl">{title}</h1>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="rounded-full tap-target">
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full tap-target relative"
                onClick={() => setNotifOpen(true)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              </Button>
              <div className="lg:hidden ml-1 h-9 w-9 rounded-full bg-gradient-accent flex items-center justify-center font-display font-bold text-accent-foreground text-sm">
                K
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_-4px_hsl(160_25%_12%_/_0.08)]">
        <div className="grid grid-cols-5 max-w-lg mx-auto px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors tap-target",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "h-7 w-12 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-primary-soft"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn("text-[10px] font-semibold", isActive && "text-primary")}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <NotificationsSheet open={notifOpen} onOpenChange={setNotifOpen} />
    </div>
  );
}
