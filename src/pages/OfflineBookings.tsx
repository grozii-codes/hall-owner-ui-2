import { useMemo, useState } from "react";
import { bookings as allBookings, halls, formatINR } from "@/data/mock";
import { Sun, Moon, Phone, MessageCircle, Plus, Search, Store, Calendar as CalIcon, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OfflineBookings() {
  const [q, setQ] = useState("");
  const [hallFilter, setHallFilter] = useState<string>("all");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slot, setSlot] = useState<"morning" | "night">("morning");
  const [hallId, setHallId] = useState(halls[0].id);
  const [amount, setAmount] = useState("");
  const [advance, setAdvance] = useState("");

  const offline = useMemo(() => {
    return allBookings.filter((b) => {
      if (b.source !== "offline") return false;
      if (hallFilter !== "all" && b.hallId !== hallFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!b.customerName.toLowerCase().includes(s) && !b.customerPhone.includes(s) && !b.id.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [q, hallFilter]);

  const handleAdd = () => {
    if (!name) return toast.error("Customer name is required");
    if (!amount) return toast.error("Total amount is required");
    toast.success("Offline booking added", {
      description: `${name} • ${format(parseISO(date), "d MMM")} • ${slot === "morning" ? "Day" : "Night"}`,
    });
    setOpen(false);
    setName(""); setPhone(""); setAmount(""); setAdvance("");
  };

  const totalRevenue = offline.reduce((s, b) => s + b.amount, 0);
  const pendingAmount = offline.reduce((s, b) => s + (b.amount - ((b.payments?.reduce((p, q) => p + q.amount, 0)) ?? b.advancePaid)), 0);

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif-display text-2xl lg:text-3xl">Offline Bookings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Walk-in & phone bookings recorded by you</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-md h-10 px-4 bg-primary tap-target">
              <Plus className="h-4 w-4 mr-1.5" /> New entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-md">
            <DialogHeader>
              <DialogTitle className="font-serif-display text-xl">New Offline Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Field label="Customer Name *">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer full name" className="h-10 rounded-md" />
              </Field>
              <Field label="Phone">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 xxxxx xxxxx" className="h-10 rounded-md" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-md" />
                </Field>
                <Field label="Slot">
                  <select value={slot} onChange={(e) => setSlot(e.target.value as any)} className="h-10 rounded-md w-full border border-border bg-card px-3 text-sm">
                    <option value="morning">Day</option>
                    <option value="night">Night</option>
                  </select>
                </Field>
              </div>
              <Field label="Hall">
                <select value={hallId} onChange={(e) => setHallId(e.target.value)} className="h-10 rounded-md w-full border border-border bg-card px-3 text-sm">
                  {halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Total ₹">
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="60000" className="h-10 rounded-md" />
                </Field>
                <Field label="Advance ₹">
                  <Input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="10000" className="h-10 rounded-md" />
                </Field>
              </div>
              <Button onClick={handleAdd} className="w-full h-11 rounded-md bg-primary mt-2">
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Entries" value={offline.length.toString()} tone="default" />
        <StatBox label="Revenue" value={formatINR(totalRevenue)} tone="success" />
        <StatBox label="Pending" value={formatINR(pendingAmount)} tone="warning" />
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, phone or ID..."
            className="pl-9 h-10 rounded-md bg-card border-border text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 lg:mx-0 px-4 lg:px-0">
          <button
            onClick={() => setHallFilter("all")}
            className={cn(
              "shrink-0 px-3 h-8 rounded-md text-xs font-semibold border tap-target transition-colors",
              hallFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
            )}
          >
            All Halls
          </button>
          {halls.map((h) => (
            <button
              key={h.id}
              onClick={() => setHallFilter(h.id)}
              className={cn(
                "shrink-0 px-3 h-8 rounded-md text-xs font-semibold border tap-target transition-colors",
                hallFilter === h.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
              )}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
        {offline.length === 0 && (
          <div className="p-12 text-center">
            <Store className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <div className="text-sm font-semibold">No offline bookings</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tap <span className="font-semibold text-foreground">New entry</span> to record a walk-in customer
            </p>
          </div>
        )}
        <div className="divide-y divide-border">
          {offline.map((b) => {
            const paid = (b.payments?.reduce((s, p) => s + p.amount, 0)) ?? b.advancePaid;
            const bal = b.amount - paid;
            const ps = paid <= 0 ? "unpaid" : bal <= 0 ? "paid" : "partial";
            const SlotIcon = b.slot === "morning" ? Sun : Moon;
            return (
              <Link
                key={b.id}
                to={`/bookings/${b.id}`}
                className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors border-l-4 border-l-accent/70"
              >
                <div className="w-12 shrink-0 flex flex-col items-center justify-center py-1 border-r border-border pr-3">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide">{format(parseISO(b.date), "MMM")}</div>
                  <div className="font-serif-display text-xl leading-none mt-0.5 tabular-nums">{format(parseISO(b.date), "d")}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{format(parseISO(b.date), "EEE")}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-sm truncate">{b.customerName}</span>
                    <span className="shrink-0 rounded border border-accent/25 bg-accent-soft text-accent px-1.5 py-0.5 text-[9px] font-bold uppercase">Offline</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <SlotIcon className="h-3 w-3" />
                    {b.slot === "morning" ? "Day" : "Night"}
                    <span>•</span>
                    <span className="truncate">{b.hallName}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">#{b.id}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-serif-display font-bold text-base tabular-nums">{formatINR(b.amount)}</span>
                    <span className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase",
                      ps === "paid" && "bg-success-soft text-success border-success/30",
                      ps === "partial" && "bg-warning-soft text-warning border-warning/35",
                      ps === "unpaid" && "bg-destructive-soft text-destructive border-destructive/30",
                    )}>
                      {ps === "paid" ? "Paid" : ps === "partial" ? `Bal ${formatINR(bal)}` : "Unpaid"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center tap-target transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-md bg-success-soft text-success hover:bg-success hover:text-success-foreground flex items-center justify-center tap-target transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: "default" | "success" | "warning" }) {
  const toneClass = {
    default: "border-border bg-card",
    success: "border-success/30 bg-success-soft/25",
    warning: "border-warning/35 bg-warning-soft/35",
  }[tone];
  const valueClass = {
    default: "",
    success: "text-success",
    warning: "text-warning",
  }[tone];
  return (
    <div className={cn("rounded-md border px-3 py-2", toneClass)}>
      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</div>
      <div className={cn("font-serif-display font-bold text-base lg:text-lg mt-0.5 truncate tabular-nums", valueClass)}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
