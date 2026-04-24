import { useMemo, useState } from "react";
import { bookings as allBookings, formatINR } from "@/data/mock";
import { Search, Phone, MessageCircle, Check, X, Globe, Store, Calendar as CalIcon, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Filter = "all" | "pending" | "confirmed" | "completed" | "rejected";
type Source = "all" | "online" | "offline";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
];

const sources: { id: Source; label: string; icon: typeof Globe | null }[] = [
  { id: "all", label: "All Sources", icon: null },
  { id: "online", label: "Online", icon: Globe },
  { id: "offline", label: "Offline", icon: Store },
];

// Status visual config — single source of truth
const statusConfig: Record<string, { label: string; bar: string; bg: string; text: string; dot: string }> = {
  pending:   { label: "Pending",   bar: "bg-warning",     bg: "bg-warning-soft",     text: "text-warning",     dot: "bg-warning" },
  confirmed: { label: "Confirmed", bar: "bg-success",     bg: "bg-success-soft",     text: "text-success",     dot: "bg-success" },
  completed: { label: "Completed", bar: "bg-info",        bg: "bg-info-soft",        text: "text-info",        dot: "bg-info" },
  rejected:  { label: "Rejected",  bar: "bg-destructive", bg: "bg-destructive-soft", text: "text-destructive", dot: "bg-destructive" },
  offline:   { label: "Offline",   bar: "bg-muted-foreground", bg: "bg-muted",       text: "text-muted-foreground", dot: "bg-muted-foreground" },
  cancelled: { label: "Cancelled", bar: "bg-destructive", bg: "bg-destructive-soft", text: "text-destructive", dot: "bg-destructive" },
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
        if (!b.customerName.toLowerCase().includes(s) && !b.id.toLowerCase().includes(s) && !b.hallName.toLowerCase().includes(s) && !b.customerPhone.includes(s)) return false;
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

  const activeFilters = (filter !== "all" ? 1 : 0) + (source !== "all" ? 1 : 0) + (date ? 1 : 0) + (q ? 1 : 0);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif-display text-2xl lg:text-3xl">Bookings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{list.length} of {allBookings.length} bookings</p>
        </div>
        {activeFilters > 0 && (
          <button
            onClick={() => { setFilter("all"); setSource("all"); setDate(""); setQ(""); }}
            className="text-xs font-semibold text-primary underline underline-offset-4"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone or booking ID"
          className="pl-10 h-11 rounded-md bg-card border-border"
        />
      </div>

      {/* Filter row: Date + Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="flex items-center gap-2 rounded-md bg-card border border-border px-3 h-11">
          <CalIcon className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold outline-none min-w-0"
          />
          {date && (
            <button onClick={() => setDate("")} className="text-destructive shrink-0 p-1">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>

        <div className="flex rounded-md bg-card border border-border h-11 overflow-hidden">
          {sources.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold tap-target transition-colors",
                  i > 0 && "border-l border-border",
                  source === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status filter chips with counts */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 lg:mx-0 px-4 lg:px-0">
        {filters.map((f) => {
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3.5 h-9 rounded-md text-xs font-semibold tap-target border transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              )}
            >
              {f.id !== "all" && (
                <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-primary-foreground" : statusConfig[f.id]?.dot)} />
              )}
              {f.label}
              <span className={cn(
                "rounded px-1.5 text-[10px] font-bold min-w-[18px] text-center",
                isActive ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
              )}>
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2">
        {list.length === 0 && (
          <div className="rounded-md bg-card border border-dashed border-border p-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <div className="text-sm font-semibold text-foreground">No bookings found</div>
            <div className="text-xs text-muted-foreground mt-1">Try changing your filters</div>
          </div>
        )}
        {list.map((b) => {
          const cfg = statusConfig[b.status] || statusConfig.pending;
          const paid = (b.payments?.reduce((s, p) => s + p.amount, 0)) ?? b.advancePaid;
          const bal = b.amount - paid;
          const ps = paid <= 0 ? "unpaid" : bal <= 0 ? "paid" : "partial";
          const dateObj = parseISO(b.date);
          const SlotIcon = b.slot === "morning" ? Sun : Moon;
          const SourceIcon = b.source === "online" ? Globe : Store;

          return (
            <div key={b.id} className="rounded-md bg-card border border-border shadow-[var(--shadow-sm)] overflow-hidden">
              <Link to={`/bookings/${b.id}`} className="flex hover:bg-muted/30 transition-colors">
                {/* Left status bar */}
                <div className={cn("w-1 shrink-0", cfg.bar)} />

                {/* Date block */}
                <div className="w-16 shrink-0 flex flex-col items-center justify-center py-3 border-r border-border bg-muted/20">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                    {format(dateObj, "MMM")}
                  </div>
                  <div className="font-serif-display text-2xl leading-none mt-0.5">
                    {format(dateObj, "d")}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {format(dateObj, "EEE")}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-3">
                  {/* Top row: badges */}
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className={cn("chip", cfg.bg, cfg.text)}>
                      <span className={cn("h-1 w-1 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                    <span className={cn(
                      "chip",
                      b.source === "online" ? "bg-info-soft text-info" : "bg-accent-soft text-accent"
                    )}>
                      <SourceIcon className="h-2.5 w-2.5" />
                      {b.source === "online" ? "Online" : "Offline"}
                    </span>
                    <span className="chip bg-muted text-muted-foreground">
                      <SlotIcon className="h-2.5 w-2.5" />
                      {b.slot === "morning" ? "Day" : "Night"}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="font-semibold text-sm text-foreground truncate">{b.customerName}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {b.hallName} · #{b.id}
                  </div>

                  {/* Bottom row: amount + payment + actions */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="font-serif-display text-base text-foreground">{formatINR(b.amount)}</span>
                      <span className={cn(
                        "chip",
                        ps === "paid" && "bg-success-soft text-success",
                        ps === "partial" && "bg-warning-soft text-warning",
                        ps === "unpaid" && "bg-destructive-soft text-destructive",
                      )}>
                        {ps === "paid" ? "Paid" : ps === "partial" ? `Bal ${formatINR(bal)}` : "Unpaid"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center tap-target transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-md bg-success-soft text-success hover:bg-success hover:text-success-foreground flex items-center justify-center tap-target transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </Link>

              {b.status === "pending" && (
                <div className="grid grid-cols-2 gap-px bg-border border-t border-border">
                  <button
                    onClick={() => toast.success(`Booking #${b.id} confirmed`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-card hover:bg-success hover:text-success-foreground text-success font-semibold text-sm tap-target transition-colors"
                  >
                    <Check className="h-4 w-4" /> Accept
                  </button>
                  <button
                    onClick={() => toast.error(`Booking #${b.id} rejected`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-card hover:bg-destructive hover:text-destructive-foreground text-destructive font-semibold text-sm tap-target transition-colors"
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
