import { bookings, customers, formatINR, type Booking } from "@/data/mock";
import { Phone, MessageCircle, Search, MapPin, Calendar as CalendarIcon, X, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const statusStyles: Record<Booking["status"], string> = {
  pending: "bg-warning-soft text-warning border-warning/30",
  confirmed: "bg-primary-soft text-primary border-primary/30",
  completed: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  offline: "bg-secondary text-secondary-foreground border-border",
};

export default function Customers() {
  const [q, setQ] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>();

  // Group bookings by customer phone
  const customerBookings = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const arr = map.get(b.customerPhone) ?? [];
      arr.push(b);
      map.set(b.customerPhone, arr);
    });
    // Sort each customer's bookings by date desc
    map.forEach((arr) => arr.sort((a, b) => b.date.localeCompare(a.date)));
    return map;
  }, []);

  const filterDateStr = filterDate ? format(filterDate, "yyyy-MM-dd") : null;

  const list = customers.filter((c) => {
    const matchesQ = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q);
    if (!matchesQ) return false;
    if (filterDateStr) {
      const cb = customerBookings.get(c.phone) ?? [];
      return cb.some((b) => b.date === filterDateStr);
    }
    return true;
  });

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">Customers</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {list.length} of {customers.length} customers
          {filterDateStr && ` • booked on ${format(filterDate!, "d MMM yyyy")}`}
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone..."
            className="pl-10 h-12 rounded-2xl bg-card border-border/60"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-12 rounded-2xl border-border/60 bg-card px-3 gap-2",
                filterDate && "border-primary text-primary"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">
                {filterDate ? format(filterDate, "d MMM") : "Date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {filterDate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilterDate(undefined)}
            className="h-12 w-12 rounded-2xl shrink-0"
            aria-label="Clear date filter"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No customers found
            {filterDateStr && ` for ${format(filterDate!, "d MMM yyyy")}`}.
          </div>
        )}

        {list.map((c) => {
          const cb = customerBookings.get(c.phone) ?? [];
          const visibleBookings = filterDateStr ? cb.filter((b) => b.date === filterDateStr) : cb;
          return (
            <div key={c.id} className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg shrink-0 shadow-glow">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.phone}</div>

                  <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-3 text-xs flex-wrap">
                      <span><span className="font-bold">{c.totalBookings}</span> <span className="text-muted-foreground">bookings</span></span>
                      <span className="font-bold text-primary">{formatINR(c.totalSpent)}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <a href={`tel:${c.phone}`} className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center tap-target">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" className="h-8 w-8 rounded-full bg-success-soft text-success flex items-center justify-center tap-target">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking dates with status */}
              <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {filterDateStr ? "Booking on selected date" : "Booking history"}
                </div>
                {visibleBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {b.slot === "morning" ? (
                        <Sun className="h-3.5 w-3.5 text-warning shrink-0" />
                      ) : (
                        <Moon className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                      <span className="font-medium">{format(parseISO(b.date), "d MMM yyyy")}</span>
                      <span className="text-muted-foreground truncate">• {b.hallName}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0 h-5 capitalize border", statusStyles[b.status])}
                    >
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
