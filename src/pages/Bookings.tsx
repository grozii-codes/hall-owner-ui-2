import { useMemo, useState } from "react";
import { bookings as allBookings, formatINR } from "@/data/mock";
import { Search, Phone, MessageCircle, Check, X, Globe, Store, Calendar as CalIcon, Sun, Moon, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Filter = "all" | "pending" | "confirmed" | "completed" | "rejected";
type Source = "all" | "online" | "offline";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Need action" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Done" },
  { id: "rejected", label: "Rejected" },
];

const sources: { id: Source; label: string; icon: typeof Globe | typeof Store | null }[] = [
  { id: "all", label: "All Sources", icon: null },
  { id: "online", label: "Online", icon: Globe },
  { id: "offline", label: "Offline", icon: Store },
];

const statusConfig: Record<string, { label: string; row: string; badge: string; dot: string; bar: string; borderBar: string }> = {
  pending: {
    label: "Need action",
    row: "border-warning/60 bg-warning-soft/35",
    badge: "bg-warning-soft text-warning border-warning/35",
    dot: "bg-warning",
    bar: "bg-warning",
    borderBar: "border-l-warning",
  },
  confirmed: {
    label: "Confirmed",
    row: "border-success/45 bg-success-soft/20",
    badge: "bg-success-soft text-success border-success/30",
    dot: "bg-success",
    bar: "bg-success",
    borderBar: "border-l-success",
  },
  completed: {
    label: "Done",
    row: "border-info/30 bg-card",
    badge: "bg-info-soft text-info border-info/25",
    dot: "bg-info",
    bar: "bg-info",
    borderBar: "border-l-info",
  },
  rejected: {
    label: "Rejected",
    row: "border-destructive/35 bg-destructive-soft/25 opacity-80",
    badge: "bg-destructive-soft text-destructive border-destructive/30",
    dot: "bg-destructive",
    bar: "bg-destructive",
    borderBar: "border-l-destructive",
  },
  offline: {
    label: "Offline entry",
    row: "border-border bg-card",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    bar: "bg-muted-foreground",
    borderBar: "border-l-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    row: "border-destructive/35 bg-destructive-soft/25 opacity-80",
    badge: "bg-destructive-soft text-destructive border-destructive/30",
    dot: "bg-destructive",
    bar: "bg-destructive",
    borderBar: "border-l-destructive",
  },
};

const paymentBadge = (paid: number, total: number) => {
  const balance = total - paid;
  if (paid <= 0) return { label: "Unpaid", className: "bg-destructive-soft text-destructive border-destructive/30" };
  if (balance <= 0) return { label: "Paid", className: "bg-success-soft text-success border-success/30" };
  return { label: `Balance ${formatINR(balance)}`, className: "bg-warning-soft text-warning border-warning/35" };
};

export default function Bookings() {
  const [filter, setFilter] = useState<Filter>("all");
  const [source, setSource] = useState<Source>("all");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  const list = useMemo(() => {
    return allBookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (source !== "all" && b.source !== source) return false;
      if (date && b.date !== date) return false;
      if (q) {
        const s = q.toLowerCase();
        const found = [b.customerName, b.id, b.hallName, b.customerPhone, b.customerAddress]
          .some((value) => value.toLowerCase().includes(s));
        if (!found) return false;
      }
      return true;
    });
  }, [filter, source, q, date]);

  const counts = useMemo(() => ({
    all: allBookings.length,
    pending: allBookings.filter((b) => b.status === "pending").length,
    confirmed: allBookings.filter((b) => b.status === "confirmed").length,
    completed: allBookings.filter((b) => b.status === "completed").length,
    rejected: allBookings.filter((b) => b.status === "rejected").length,
  }), []);

  const sourceCounts = useMemo(() => ({
    online: allBookings.filter((b) => b.source === "online").length,
    offline: allBookings.filter((b) => b.source === "offline").length,
  }), []);

  const activeFilters = (filter !== "all" ? 1 : 0) + (source !== "all" ? 1 : 0) + (date ? 1 : 0) + (q ? 1 : 0);
  const urgent = allBookings.filter((b) => b.status === "pending");

  const clearAll = () => {
    setFilter("all");
    setSource("all");
    setDate("");
    setQ("");
  };

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif-display text-2xl lg:text-3xl">Booking Desk</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {counts.pending > 0 ? `${counts.pending} bookings need confirmation` : "No pending confirmations"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:w-[420px]">
          <button
            onClick={() => setFilter("pending")}
            className="rounded-md border border-warning/35 bg-warning-soft/45 px-3 py-2 text-left tap-target"
          >
            <div className="text-[10px] uppercase tracking-wide font-bold text-warning">Pending</div>
            <div className="text-xl font-serif-display font-bold text-warning tabular-nums">{counts.pending}</div>
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className="rounded-md border border-success/30 bg-success-soft/30 px-3 py-2 text-left tap-target"
          >
            <div className="text-[10px] uppercase tracking-wide font-bold text-success">Confirmed</div>
            <div className="text-xl font-serif-display font-bold text-success tabular-nums">{counts.confirmed}</div>
          </button>
          <button
            onClick={() => setSource(source === "offline" ? "all" : "offline")}
            className="rounded-md border border-border bg-card px-3 py-2 text-left tap-target"
          >
            <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">Offline</div>
            <div className="text-xl font-serif-display font-bold tabular-nums">{sourceCounts.offline}</div>
          </button>
        </div>
      </div>

      {urgent.length > 0 && filter !== "pending" && (
        <button
          onClick={() => setFilter("pending")}
          className="w-full rounded-md border border-warning/45 bg-warning-soft/50 px-4 py-3 flex items-center justify-between gap-3 text-left tap-target"
        >
          <span className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <span className="text-sm font-semibold truncate">Confirm pending bookings first</span>
          </span>
          <span className="text-xs font-bold text-warning shrink-0">View {urgent.length}</span>
        </button>
      )}

      <div className="sticky top-[60px] lg:top-16 z-20 -mx-4 lg:mx-0 px-4 lg:px-0 py-2 bg-background/95 backdrop-blur-md border-y lg:border-y-0 border-border space-y-2">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customer, phone, booking ID, hall..."
              className="pl-9 pr-9 h-10 rounded-md bg-card border-border text-sm"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <label className={cn(
            "relative flex items-center justify-center rounded-md border h-10 px-3 cursor-pointer shrink-0 transition-colors",
            date ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"
          )}>
            <CalIcon className="h-4 w-4" />
            {date && <span className="ml-1.5 text-xs font-bold">{format(parseISO(date), "d MMM")}</span>}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-4 lg:mx-0 px-4 lg:px-0">
          {filters.map((f) => {
            const isActive = filter === f.id;
            const cfg = f.id === "all" ? null : statusConfig[f.id];
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-semibold tap-target border transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                )}
              >
                {cfg && <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-primary-foreground" : cfg.dot)} />}
                {f.label}
                <span className={cn(
                  "rounded px-1.5 text-[10px] font-bold min-w-[18px] text-center leading-tight",
                  isActive ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                )}>
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
          <div className="shrink-0 w-px h-6 bg-border mx-1" />
          {sources.filter((s) => s.id !== "all").map((s) => {
            const Icon = s.icon!;
            const isActive = source === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSource(isActive ? "all" : s.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-semibold tap-target border transition-colors",
                  isActive
                    ? "bg-accent-soft text-accent border-accent/40"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
          {activeFilters > 0 && (
            <button onClick={clearAll} className="shrink-0 px-3 h-8 rounded-md text-xs font-semibold text-primary border border-primary/30 bg-primary-soft tap-target">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="hidden lg:block rounded-md border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
        <div className="grid grid-cols-[92px_1.25fr_1fr_120px_145px_132px] gap-4 px-4 py-2.5 bg-muted/45 border-b border-border text-[11px] uppercase tracking-wide font-bold text-muted-foreground">
          <div>Date</div>
          <div>Customer</div>
          <div>Hall / Slot</div>
          <div>Amount</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {list.length === 0 && (
          <div className="p-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <div className="text-sm font-semibold">No bookings found</div>
            <div className="text-xs text-muted-foreground mt-1">Try clearing filters or changing date</div>
          </div>
        )}

        <div className="divide-y divide-border">
          {list.map((b) => {
            const cfg = statusConfig[b.status] || statusConfig.pending;
            const paid = b.payments?.reduce((sum, p) => sum + p.amount, 0) ?? b.advancePaid;
            const payment = paymentBadge(paid, b.amount);
            const dateObj = parseISO(b.date);
            const SlotIcon = b.slot === "morning" ? Sun : Moon;
            const SourceIcon = b.source === "online" ? Globe : Store;

            return (
              <div key={b.id} className={cn("relative grid grid-cols-[92px_1.25fr_1fr_120px_145px_132px] gap-4 px-4 py-3 items-center border-l-4", cfg.row, cfg.borderBar)}>
                <Link to={`/bookings/${b.id}`} className="absolute inset-0" aria-label={`Open booking ${b.id}`} />
                <div className="relative z-10">
                  <div className="text-[11px] font-bold uppercase text-muted-foreground">{format(dateObj, "MMM")}</div>
                  <div className="text-xl font-serif-display font-bold leading-none tabular-nums">{format(dateObj, "d")}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{format(dateObj, "EEE")}</div>
                </div>
                <div className="relative z-10 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="font-semibold text-sm truncate">{b.customerName}</div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">#{b.id}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{b.customerPhone} · {b.customerAddress}</div>
                </div>
                <div className="relative z-10 min-w-0">
                  <div className="text-sm font-semibold truncate">{b.hallName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <SlotIcon className="h-3.5 w-3.5" /> {b.slot === "morning" ? "Day slot" : "Night slot"}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="font-serif-display text-lg font-bold tabular-nums">{formatINR(b.amount)}</div>
                  <div className={cn("inline-flex mt-1 rounded border px-1.5 py-0.5 text-[10px] font-bold", payment.className)}>{payment.label}</div>
                </div>
                <div className="relative z-10 space-y-1.5">
                  <div className={cn("inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-bold", cfg.badge)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} /> {cfg.label}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <SourceIcon className="h-3 w-3" /> {b.source === "online" ? "Online booking" : "Offline entry"}
                  </div>
                </div>
                <div className="relative z-20 flex items-center justify-end gap-1.5">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => toast.success(`Booking #${b.id} confirmed`)}
                        className="h-9 px-3 rounded-md bg-success text-success-foreground hover:bg-success/90 text-xs font-bold tap-target"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => toast.error(`Booking #${b.id} rejected`)}
                        className="h-9 w-9 rounded-md bg-destructive-soft text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center tap-target"
                        aria-label="Reject booking"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {b.status !== "pending" && (
                    <>
                      <a href={`tel:${b.customerPhone}`} className="h-9 w-9 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center tap-target transition-colors" aria-label="Call customer">
                        <Phone className="h-4 w-4" />
                      </a>
                      <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" className="h-9 w-9 rounded-md bg-success-soft text-success hover:bg-success hover:text-success-foreground flex items-center justify-center tap-target transition-colors" aria-label="WhatsApp customer">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:hidden space-y-2">
        {list.length === 0 && (
          <div className="rounded-md bg-card border border-dashed border-border p-10 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <div className="text-sm font-semibold text-foreground">No bookings found</div>
            <div className="text-xs text-muted-foreground mt-1">Try changing your filters</div>
          </div>
        )}

        {list.map((b) => {
          const cfg = statusConfig[b.status] || statusConfig.pending;
          const paid = b.payments?.reduce((sum, p) => sum + p.amount, 0) ?? b.advancePaid;
          const payment = paymentBadge(paid, b.amount);
          const dateObj = parseISO(b.date);
          const SlotIcon = b.slot === "morning" ? Sun : Moon;
          const SourceIcon = b.source === "online" ? Globe : Store;

          return (
            <div key={b.id} className={cn("rounded-md border-2 shadow-[var(--shadow-sm)] overflow-hidden", cfg.row)}>
              <Link to={`/bookings/${b.id}`} className="flex">
                <div className={cn("w-1.5 shrink-0", cfg.bar)} />
                <div className="w-14 shrink-0 flex flex-col items-center justify-center py-3 border-r border-border bg-card/60">
                  <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-wide">{format(dateObj, "MMM")}</div>
                  <div className="font-serif-display text-2xl leading-none mt-0.5 tabular-nums">{format(dateObj, "d")}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{format(dateObj, "EEE")}</div>
                </div>
                <div className="flex-1 min-w-0 p-3">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold", cfg.badge)}>
                      <span className={cn("h-1 w-1 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      <SourceIcon className="h-2.5 w-2.5" /> {b.source === "online" ? "Online" : "Offline"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      <SlotIcon className="h-2.5 w-2.5" /> {b.slot === "morning" ? "Day" : "Night"}
                    </span>
                  </div>
                  <div className="font-semibold text-sm truncate">{b.customerName}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{b.hallName} · #{b.id}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-serif-display text-lg font-bold tabular-nums">{formatINR(b.amount)}</div>
                      <div className={cn("inline-flex mt-1 rounded border px-1.5 py-0.5 text-[10px] font-bold", payment.className)}>{payment.label}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-9 w-9 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center tap-target transition-colors">
                        <Phone className="h-4 w-4" />
                      </a>
                      <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-9 w-9 rounded-md bg-success-soft text-success hover:bg-success hover:text-success-foreground flex items-center justify-center tap-target transition-colors">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </Link>

              {b.status === "pending" && (
                <div className="grid grid-cols-2 gap-px bg-border border-t border-border">
                  <button
                    onClick={() => toast.success(`Booking #${b.id} confirmed`)}
                    className="flex items-center justify-center gap-1.5 py-3 bg-success text-success-foreground hover:bg-success/90 font-bold text-sm tap-target transition-colors"
                  >
                    <Check className="h-4 w-4" /> Confirm
                  </button>
                  <button
                    onClick={() => toast.error(`Booking #${b.id} rejected`)}
                    className="flex items-center justify-center gap-1.5 py-3 bg-card hover:bg-destructive hover:text-destructive-foreground text-destructive font-bold text-sm tap-target transition-colors"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
