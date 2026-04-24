import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Calendar, Home, Building2, BarChart3, Store, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { halls } from "@/data/mock";
import NotificationsSheet from "./NotificationsSheet";
import { toast } from "sonner";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/bookings", icon: Calendar, label: "Bookings" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/halls", icon: Building2, label: "Halls" },
  { to: "/offline", icon: Store, label: "Offline" },
];

const desktopNav = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/bookings", icon: Calendar, label: "Bookings" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/halls", icon: Building2, label: "My Halls" },
  { to: "/offline", icon: Store, label: "Offline Bookings" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function AppLayout() {
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const titleMap: Record<string, string> = {
    "/": "Dashboard",
    "/bookings": "Bookings",
    "/calendar": "Calendar",
    "/halls": "My Halls",
    "/offline": "Offline Bookings",
    "/analytics": "Analytics",
  };
  const title = titleMap[location.pathname] || "BookMyHall";
  const primaryHall = halls[0];

  const logout = () => {
    localStorage.removeItem("bmh_owner_session");
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-serif-display font-bold text-[17px] text-primary-foreground">BookMyHall</span>
          </div>
        </div>

        {/* Hall + owner block */}
        <div className="px-5 py-4 border-b border-sidebar-border">
          <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50 font-bold mb-1.5">
            Managing
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-serif-display font-bold text-base text-primary-foreground truncate">
                {primaryHall.name}
              </div>
              <div className="text-[11px] text-sidebar-foreground/60 truncate">
                Kareem Owner
              </div>
            </div>
            {halls.length > 1 && <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 shrink-0" />}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {desktopNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-[17px] w-[17px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <div className="text-center pt-2 border-t border-sidebar-border">
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Service provided by</p>
            <p className="text-xs font-serif-display font-bold text-accent mt-0.5">BookMyHall</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-15 lg:h-16">
            <div className="flex items-center gap-2.5 lg:hidden min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-serif-display font-bold text-[15px] leading-tight truncate">{primaryHall.name}</div>
                <div className="text-[10px] text-muted-foreground leading-tight truncate">Owner Console</div>
              </div>
            </div>
            <h1 className="hidden lg:block font-serif-display font-bold text-xl">{title}</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg tap-target relative h-10 w-10"
                onClick={() => setNotifOpen(true)}
              >
                <Bell className="h-[19px] w-[19px]" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-8 animate-fade-in">
          <Outlet />
        </main>

        {/* Mobile footer credit */}
        <div className="lg:hidden text-center py-3 mb-16 text-[10px] text-muted-foreground border-t border-border bg-background">
          Service provided by <span className="font-serif-display font-bold text-foreground">BookMyHall</span>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-[0_-2px_10px_hsl(220_35%_14%/0.06)]">
        <div className="grid grid-cols-5 max-w-lg mx-auto px-1 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-1.5 transition-colors tap-target",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.4 : 1.8} />
                  <span className={cn("text-[10px] font-semibold tracking-tight", isActive && "text-primary")}>
                    {item.label}
                  </span>
                  {isActive && <span className="h-0.5 w-6 bg-accent rounded-full mt-0.5" />}
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
