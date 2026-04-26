import { useMemo, useState } from "react";
import { bookings as allBookings, halls, formatINR } from "@/data/mock";
import { Building2, Calendar as CalIcon, IndianRupee, ArrowRight, Phone, MessageCircle, Check, X, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format, parseISO, isToday, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RangeKey = "today" | "week" | "month" | "custom";

const ranges: { id: RangeKey; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "custom", label: "Custom" },
];

export default function Dashboard() {
  const [range, setRange] = useState<RangeKey>("month");
  const [customDate, setCustomDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const { from, to, label } = useMemo(() => {
    const today = new Date();
    if (range === "today") return { from: today, to: today, label: format(today, "d MMM yyyy") };
    if (range === "week") return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }), label: "This week" };
    if (range === "month") return { from: startOfMonth(today), to: endOfMonth(today), label: format(today, "MMMM yyyy") };
    const d = parseISO(customDate);
    return { from: d, to: d, label: format(d, "d MMM yyyy") };
  }, [range, customDate]);

  const filtered = useMemo(() => {
    return allBookings.filter((b) => {
      const d = parseISO(b.date);
      return isWithinInterval(d, { start: from, end: to });
    });
  }, [from, to]);

  const revenue = filtered.filter((b) => b.status !== "rejected").reduce((s, b) => s + b.amount, 0);
  const confirmedCount = filtered.filter((b) => b.status === "confirmed" || b.status === "completed").length;
  const pending = filtered.filter((b) => b.status === "pending");
  const activeHalls = halls.filter((h) => h.active).length;

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: from, end: to });
    const limited = days.length > 14 ? days.filter((_, i) => i % Math.ceil(days.length / 14) === 0) : days;
    return limited.map((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const dayB = allBookings.filter((b) => b.date === ds && b.status !== "rejected");
      return { day: format(d, days.length > 7 ? "d" : "EEE"), revenue: dayB.reduce((s, b) => s + b.amount, 0) };
    });
  }, [from, to]);

  const handleAccept = (id: string) => toast.success(`Booking #${id} confirmed`);
  const handleReject = (id: string) => toast.error(`Booking #${id} rejected`);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-7xl mx-auto space-y-4">
      {/* Greeting + inline period switcher */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{greet}</p>
            <h2 className="font-display font-bold text-2xl lg:text-3xl mt-0.5">Kareem</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-muted-foreground">{format(new Date(), "EEEE")}</p>
            <p className="text-sm font-semibold">{format(new Date(), "d MMM yyyy")}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "shrink-0 px-3 h-8 rounded-full text-xs font-semibold tap-target transition-colors border",
                range === r.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
          {range === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="shrink-0 h-8 rounded-full bg-card border border-border px-3 text-xs font-semibold"
            />
          )}
          <span className="shrink-0 ml-auto text-[11px] text-muted-foreground font-medium pl-2">{label}</span>
        </div>
      </div>

      {/* Stats — clean, scannable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="rounded-lg bg-card border border-border p-3.5 shadow-[var(--shadow-card)]">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Revenue</div>
          <div className="text-2xl font-display font-bold mt-1.5 tabular-nums">{formatINR(revenue)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{filtered.length} bookings</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3.5 shadow-[var(--shadow-card)]">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Confirmed</div>
          <div className="text-2xl font-display font-bold mt-1.5 text-success tabular-nums">{confirmedCount}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">In this period</div>
        </div>
        <div className={cn(
          "rounded-lg border p-3.5 shadow-[var(--shadow-card)]",
          pending.length > 0 ? "bg-warning-soft/50 border-warning/40" : "bg-card border-border"
        )}>
          <div className="text-[10px] uppercase tracking-wide font-bold flex items-center gap-1.5">
            <span className={cn("text-muted-foreground")}>Pending</span>
            {pending.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />}
          </div>
          <div className={cn("text-2xl font-display font-bold mt-1.5 tabular-nums", pending.length > 0 ? "text-warning" : "")}>{pending.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{pending.length > 0 ? "Tap to act" : "All clear"}</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3.5 shadow-[var(--shadow-card)]">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Halls Live</div>
          <div className="text-2xl font-display font-bold mt-1.5 tabular-nums">{activeHalls}<span className="text-base text-muted-foreground font-normal">/{halls.length}</span></div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Active listings</div>
        </div>
      </div>

      {/* Pending action — most important */}
      {pending.length > 0 && (
        <div className="rounded-xl bg-card border border-warning/30 shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-warning-soft/40 border-b border-warning/20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <h3 className="font-display font-bold text-sm">Pending Approval</h3>
              <span className="chip bg-warning text-warning-foreground">{pending.length}</span>
            </div>
            <Link to="/bookings" className="text-xs text-primary font-semibold flex items-center gap-1">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {pending.slice(0, 4).map((b) => (
              <div key={b.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/bookings/${b.id}`} className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{b.customerName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {b.hallName} • {format(parseISO(b.date), "d MMM")} • {b.slot === "morning" ? "Day" : "Night"}
                    </div>
                    <div className="text-xs text-foreground/70 mt-1 truncate">📍 {b.customerAddress}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-display font-bold text-primary">{formatINR(b.amount)}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">#{b.id}</span>
                    </div>
                  </Link>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <a href={`tel:${b.customerPhone}`} className="h-8 w-8 rounded-md bg-muted flex items-center justify-center tap-target">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" className="h-8 w-8 rounded-md bg-success-soft text-success flex items-center justify-center tap-target">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleAccept(b.id)} size="sm" className="flex-1 h-9 bg-success hover:bg-success/90 text-white rounded-md">
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button onClick={() => handleReject(b.id)} size="sm" variant="outline" className="flex-1 h-9 rounded-md border-destructive/30 text-destructive hover:bg-destructive-soft">
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue chart */}
      <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] p-4 lg:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-sm">Revenue Overview</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-lg">{formatINR(revenue)}</div>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [formatINR(v), "Revenue"]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border">
          <h3 className="font-display font-bold text-sm">Recent Bookings</h3>
          <Link to="/bookings" className="text-xs text-primary font-semibold flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {filtered.slice(0, 6).map((b) => (
            <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
              <div className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center font-display font-bold text-xs shrink-0",
                b.status === "confirmed" && "bg-success-soft text-success",
                b.status === "pending" && "bg-warning-soft text-warning",
                b.status === "completed" && "bg-info-soft text-info",
                b.status === "rejected" && "bg-destructive-soft text-destructive",
                b.status === "offline" && "bg-muted text-muted-foreground",
              )}>
                {b.customerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{b.customerName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{b.hallName} • {format(parseISO(b.date), "d MMM")} • {b.slot === "morning" ? "Day" : "Night"}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display font-bold text-sm">{formatINR(b.amount)}</div>
                <div className={cn(
                  "text-[10px] uppercase font-bold tracking-wide",
                  b.status === "confirmed" && "text-success",
                  b.status === "pending" && "text-warning",
                  b.status === "completed" && "text-info",
                  b.status === "rejected" && "text-destructive",
                )}>{b.status}</div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No bookings in this period</div>
          )}
        </div>
      </div>
    </div>
  );
}
