import { useMemo, useState } from "react";
import { bookings as allBookings, formatINR } from "@/data/mock";
import { Search, Phone, MessageCircle, ChevronRight, Check, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Filter = "all" | "pending" | "confirmed" | "completed" | "rejected" | "offline";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "offline", label: "Offline" },
  { id: "rejected", label: "Rejected" },
];

export default function Bookings() {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  const list = useMemo(() => {
    return allBookings.filter((b) => {
      if (filter === "offline" && b.source !== "offline") return false;
      if (filter !== "all" && filter !== "offline" && b.status !== filter) return false;
      if (date && b.date !== date) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!b.customerName.toLowerCase().includes(s) && !b.id.toLowerCase().includes(s) && !b.hallName.toLowerCase().includes(s) && !b.customerPhone.includes(s)) return false;
      }
      return true;
    });
  }, [filter, q, date]);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">Bookings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and respond to all booking requests</p>
      </div>

      {/* Search + date */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, ID, hall or phone..."
            className="pl-10 h-12 rounded-2xl bg-card border-border/60"
          />
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-12 rounded-2xl bg-card border border-border/60 px-4 text-sm"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 lg:mx-0 px-4 lg:px-0 pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 px-4 h-9 rounded-full text-sm font-semibold tap-target transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-card text-muted-foreground border border-border/60 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {list.length === 0 && (
          <div className="rounded-2xl bg-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No bookings match your filter
          </div>
        )}
        {list.map((b) => (
          <Link key={b.id} to={`/bookings/${b.id}`} className="block rounded-2xl bg-card border border-border/50 p-4 shadow-sm hover:shadow-card transition-all tap-target">
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center font-display font-bold shrink-0",
                b.status === "confirmed" && "bg-success-soft text-success",
                b.status === "pending" && "bg-warning-soft text-warning",
                b.status === "completed" && "bg-info-soft text-info",
                b.status === "rejected" && "bg-destructive-soft text-destructive",
              )}>
                {b.customerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{b.customerName}</div>
                    <div className="text-xs text-muted-foreground font-mono">#{b.id}</div>
                  </div>
                  <span className={cn(
                    "chip uppercase text-[10px] tracking-wide",
                    b.status === "confirmed" && "bg-success-soft text-success",
                    b.status === "pending" && "bg-warning-soft text-warning",
                    b.status === "completed" && "bg-info-soft text-info",
                    b.status === "rejected" && "bg-destructive-soft text-destructive",
                  )}>{b.status}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">{b.hallName}</span>
                  <span>•</span>
                  <span>{format(parseISO(b.date), "d MMM yyyy")}</span>
                  <span>•</span>
                  <span className="capitalize">{b.slot === "morning" ? "Day" : "Night"}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="font-display font-bold text-base">{formatINR(b.amount)}</div>
                  <div className="flex items-center gap-1.5">
                    <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center tap-target">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-success-soft text-success flex items-center justify-center tap-target">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
