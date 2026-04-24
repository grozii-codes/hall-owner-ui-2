import { useMemo, useState } from "react";
import { bookings as allBookings, formatINR } from "@/data/mock";
import { Search, Phone, MessageCircle, ChevronRight, Check, X, MapPin, Globe, Store, Calendar as CalIcon } from "lucide-react";
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
  { id: "completed", label: "Done" },
  { id: "rejected", label: "Rejected" },
];

const sources: { id: Source; label: string; icon: typeof Globe | null }[] = [
  { id: "all", label: "All", icon: null },
  { id: "online", label: "Online", icon: Globe },
  { id: "offline", label: "Offline", icon: Store },
];

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

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="font-serif-display font-bold text-2xl lg:text-3xl">Bookings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Tap any booking to view details, accept, or collect payment</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by customer, phone or booking ID..."
          className="pl-10 h-12 rounded-xl bg-card border-border"
        />
      </div>

      {/* Date filter — labeled, mobile-friendly */}
      <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 h-12">
        <CalIcon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold outline-none min-w-0"
        />
        {date && (
          <button onClick={() => setDate("")} className="text-xs font-semibold text-destructive shrink-0 px-2 py-1 rounded-md hover:bg-destructive-soft">
            Clear
          </button>
        )}
      </div>

      {/* Source toggle */}
      <div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Source</div>
        <div className="inline-flex p-1 rounded-full bg-muted border border-border w-full">
          {sources.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold tap-target transition-all",
                  source === s.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
      <div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Status</div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 lg:mx-0 px-4 lg:px-0 pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-4 h-10 rounded-full text-sm font-semibold tap-target transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground"
              )}
            >
              {f.label}
              <span className={cn(
                "rounded-full px-1.5 text-[10px] font-bold min-w-5 text-center",
                filter === f.id ? "bg-primary-foreground/20" : "bg-muted"
              )}>
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {list.length === 0 && (
          <div className="rounded-xl bg-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No bookings match your filter
          </div>
        )}
        {list.map((b) => (
          <div key={b.id} className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
            <Link to={`/bookings/${b.id}`} className="block p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-md flex items-center justify-center font-display font-bold shrink-0",
                  b.status === "confirmed" && "bg-success-soft text-success",
                  b.status === "pending" && "bg-warning-soft text-warning",
                  b.status === "completed" && "bg-info-soft text-info",
                  b.status === "rejected" && "bg-destructive-soft text-destructive",
                  b.status === "offline" && "bg-muted text-muted-foreground",
                )}>
                  {b.customerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-sm">{b.customerName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">#{b.id}</div>
                    </div>
                    <span className={cn(
                      "chip uppercase tracking-wide",
                      b.status === "confirmed" && "bg-success-soft text-success",
                      b.status === "pending" && "bg-warning-soft text-warning",
                      b.status === "completed" && "bg-info-soft text-info",
                      b.status === "rejected" && "bg-destructive-soft text-destructive",
                      b.status === "offline" && "bg-muted text-muted-foreground",
                    )}>{b.status}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    {b.source === "online" ? <Globe className="h-3 w-3 text-info" /> : <Store className="h-3 w-3 text-muted-foreground" />}
                    <span className="font-medium text-foreground/80">{b.hallName}</span>
                    {" • "}{format(parseISO(b.date), "d MMM")}{" • "}
                    <span className="capitalize">{b.slot === "morning" ? "Day" : "Night"}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {b.customerAddress}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="font-display font-bold text-base text-primary">{formatINR(b.amount)}</span>
                      {(() => {
                        const paid = (b.payments?.reduce((s, p) => s + p.amount, 0)) ?? b.advancePaid;
                        const bal = b.amount - paid;
                        const ps = paid <= 0 ? "unpaid" : bal <= 0 ? "paid" : "partial";
                        return (
                          <span className={cn(
                            "chip uppercase tracking-wide text-[9px]",
                            ps === "paid" && "bg-success-soft text-success",
                            ps === "partial" && "bg-warning-soft text-warning",
                            ps === "unpaid" && "bg-destructive-soft text-destructive",
                          )}>
                            {ps === "paid" ? "Paid" : ps === "partial" ? `Bal ${formatINR(bal)}` : "Unpaid"}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center tap-target">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-7 w-7 rounded-md bg-success-soft text-success flex items-center justify-center tap-target">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            {b.status === "pending" && (
              <div className="grid grid-cols-2 gap-px bg-border border-t border-border">
                <button
                  onClick={() => toast.success(`Booking #${b.id} confirmed`)}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-card hover:bg-success-soft text-success font-semibold text-sm tap-target transition-colors"
                >
                  <Check className="h-4 w-4" /> Accept
                </button>
                <button
                  onClick={() => toast.error(`Booking #${b.id} rejected`)}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-card hover:bg-destructive-soft text-destructive font-semibold text-sm tap-target transition-colors"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
