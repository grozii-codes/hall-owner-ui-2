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

  // Add-offline form
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

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="h-3.5 w-3.5" /> Walk-in & Phone bookings
          </div>
          <h2 className="font-serif-display font-bold text-2xl lg:text-3xl">Offline Bookings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all bookings taken in person or by phone</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full h-11 px-5 bg-primary shadow-glow shrink-0">
              <Plus className="h-4 w-4 mr-1.5" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif-display text-xl">New Offline Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-3.5 mt-2">
              <Field label="Customer Name *">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className="h-11 rounded-xl" />
              </Field>
              <Field label="Phone">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 xxxxx xxxxx" className="h-11 rounded-xl" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" />
                </Field>
                <Field label="Slot">
                  <select value={slot} onChange={(e) => setSlot(e.target.value as any)} className="h-11 rounded-xl w-full border border-border bg-card px-3 text-sm">
                    <option value="morning">Day</option>
                    <option value="night">Night</option>
                  </select>
                </Field>
              </div>
              <Field label="Hall">
                <select value={hallId} onChange={(e) => setHallId(e.target.value)} className="h-11 rounded-xl w-full border border-border bg-card px-3 text-sm">
                  {halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Total ₹">
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="60000" className="h-11 rounded-xl" />
                </Field>
                <Field label="Advance ₹">
                  <Input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="10000" className="h-11 rounded-xl" />
                </Field>
              </div>
              <Button onClick={handleAdd} className="w-full h-12 rounded-xl bg-primary mt-2 shadow-glow">
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, phone or ID..."
            className="pl-10 h-12 rounded-xl bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 lg:mx-0 px-4 lg:px-0">
          <button
            onClick={() => setHallFilter("all")}
            className={cn(
              "shrink-0 px-4 h-9 rounded-full text-sm font-semibold transition-colors",
              hallFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
            )}
          >
            All Halls
          </button>
          {halls.map((h) => (
            <button
              key={h.id}
              onClick={() => setHallFilter(h.id)}
              className={cn(
                "shrink-0 px-4 h-9 rounded-full text-sm font-semibold transition-colors",
                hallFilter === h.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
              )}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatBox label="Total" value={offline.length.toString()} />
        <StatBox label="Revenue" value={formatINR(offline.reduce((s, b) => s + b.amount, 0))} />
        <StatBox label="Pending ₹" value={formatINR(offline.reduce((s, b) => s + (b.amount - ((b.payments?.reduce((p, q) => p + q.amount, 0)) ?? b.advancePaid)), 0))} />
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {offline.length === 0 && (
          <div className="rounded-xl bg-card border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <Store className="h-10 w-10 mx-auto mb-2 opacity-30" />
            No offline bookings yet. Tap <span className="font-semibold text-foreground">Add</span> to record one.
          </div>
        )}
        {offline.map((b) => {
          const paid = (b.payments?.reduce((s, p) => s + p.amount, 0)) ?? b.advancePaid;
          const bal = b.amount - paid;
          const ps = paid <= 0 ? "unpaid" : bal <= 0 ? "paid" : "partial";
          const SlotIcon = b.slot === "morning" ? Sun : Moon;
          return (
            <Link key={b.id} to={`/bookings/${b.id}`} className="block rounded-xl bg-card border border-border p-3.5 shadow-[var(--shadow-card)] hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                  b.slot === "morning" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"
                )}>
                  <SlotIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-sm truncate">{b.customerName}</span>
                    <span className="chip bg-accent-soft text-accent uppercase text-[9px]">Offline</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <CalIcon className="h-3 w-3" />
                    {format(parseISO(b.date), "d MMM")}
                    <span>•</span>
                    <span>{b.slot === "morning" ? "Day" : "Night"}</span>
                    <span>•</span>
                    <span className="truncate">{b.hallName}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-serif-display font-bold text-base text-primary">{formatINR(b.amount)}</span>
                    <span className={cn(
                      "chip uppercase text-[9px]",
                      ps === "paid" && "bg-success-soft text-success",
                      ps === "partial" && "bg-warning-soft text-warning",
                      ps === "unpaid" && "bg-destructive-soft text-destructive",
                    )}>
                      {ps === "paid" ? "Paid" : ps === "partial" ? `Bal ${formatINR(bal)}` : "Unpaid"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-lg bg-success-soft text-success flex items-center justify-center">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-3 text-center shadow-[var(--shadow-card)]">
      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</div>
      <div className="font-serif-display font-bold text-base lg:text-lg mt-0.5 truncate">{value}</div>
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
