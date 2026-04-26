import { useState, useMemo } from "react";
import { halls, dayStatusFor, formatINR } from "@/data/mock";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, X, Phone, MessageCircle, Globe, Store, Sun, Moon, ChevronRight as ChevRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const statusColors: Record<string, {
  dot: string;
  border: string;
  strip: string;
  text: string;
  label: string;
  shortLabel: string;
}> = {
  available: {
    dot: "bg-success",
    border: "border-t-success",
    strip: "bg-success",
    text: "text-success",
    label: "Available",
    shortLabel: "Open",
  },
  "morning-only": {
    dot: "bg-info",
    border: "border-t-info",
    strip: "bg-info",
    text: "text-info",
    label: "Partial",
    shortLabel: "1 slot",
  },
  "night-only": {
    dot: "bg-info",
    border: "border-t-info",
    strip: "bg-info",
    text: "text-info",
    label: "Partial",
    shortLabel: "1 slot",
  },
  pending: {
    dot: "bg-warning",
    border: "border-t-warning",
    strip: "bg-warning",
    text: "text-warning",
    label: "Pending",
    shortLabel: "Hold",
  },
  full: {
    dot: "bg-destructive",
    border: "border-t-destructive",
    strip: "bg-destructive",
    text: "text-destructive",
    label: "Booked",
    shortLabel: "Full",
  },
  past: {
    dot: "bg-muted-foreground",
    border: "border-t-border",
    strip: "bg-muted",
    text: "text-muted-foreground/60",
    label: "Past",
    shortLabel: "",
  },
};

export default function CalendarPage() {
  const [hallId, setHallId] = useState(halls[0].id);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const selectedInfo = selected ? dayStatusFor(selected, hallId) : null;
  const selectedHall = halls.find((h) => h.id === hallId)!;
  const monthSummary = useMemo(() => {
    const currentMonthDays = days.filter((d) => isSameMonth(d, cursor));
    return currentMonthDays.reduce((acc, day) => {
      const info = dayStatusFor(format(day, "yyyy-MM-dd"), hallId);
      if (info.status === "available") acc.available += 1;
      if (info.status === "pending") acc.pending += 1;
      if (info.status === "full") acc.booked += 1;
      if (info.status === "morning-only" || info.status === "night-only") acc.partial += 1;
      return acc;
    }, { available: 0, partial: 0, pending: 0, booked: 0 });
  }, [cursor, days, hallId]);

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif-display text-2xl lg:text-3xl">Availability</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Clean month view for booking decisions</p>
        </div>
        <select
          value={hallId}
          onChange={(e) => setHallId(e.target.value)}
          className="h-10 rounded-md bg-card border border-border px-3 text-sm font-semibold lg:min-w-64"
        >
          {halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <SummaryBox label="Open" value={monthSummary.available} tone="success" />
        <SummaryBox label="Partial" value={monthSummary.partial} tone="info" />
        <SummaryBox label="Pending" value={monthSummary.pending} tone="warning" />
        <SummaryBox label="Booked" value={monthSummary.booked} tone="destructive" />
      </div>

      <div className="rounded-lg bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center justify-between px-3 lg:px-4 py-3 border-b border-border bg-muted/30">
          <button onClick={() => setCursor(addMonths(cursor, -1))} className="h-9 w-9 rounded-md bg-card border border-border flex items-center justify-center tap-target" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h3 className="font-serif-display font-bold text-lg leading-none">{format(cursor, "MMMM yyyy")}</h3>
            <div className="flex items-center justify-center gap-3 mt-1.5 text-[10px] font-bold text-muted-foreground">
              <LegendDot color="bg-success" label="Open" />
              <LegendDot color="bg-info" label="Partial" />
              <LegendDot color="bg-warning" label="Pending" />
              <LegendDot color="bg-destructive" label="Booked" />
            </div>
          </div>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="h-9 w-9 rounded-md bg-card border border-border flex items-center justify-center tap-target" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-card text-[10px] lg:text-xs uppercase font-bold text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center py-2 border-r border-border last:border-r-0">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 bg-border gap-px">
          {days.map((d) => {
            const ds = format(d, "yyyy-MM-dd");
            const info = dayStatusFor(ds, hallId);
            const isOtherMonth = !isSameMonth(d, cursor);
            const isToday = isSameDay(d, new Date());
            const colors = statusColors[info.status];
            const hasMorning = info.bookings.some((b: any) => b.slot === "morning");
            const hasNight = info.bookings.some((b: any) => b.slot === "night");
            return (
              <button
                key={ds}
                onClick={() => info.status !== "past" && setSelected(ds)}
                disabled={info.status === "past"}
                className={cn(
                  "relative min-h-[58px] lg:min-h-[92px] bg-card p-1.5 lg:p-2 text-left border-t-[3px] transition-colors tap-target overflow-hidden",
                  colors.border,
                  isOtherMonth && "bg-muted/30 opacity-60",
                  info.status === "past" && "cursor-not-allowed bg-muted/35",
                  info.status !== "past" && "hover:bg-muted/35",
                  isToday && "ring-2 ring-primary ring-inset"
                )}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={cn(
                    "text-sm lg:text-base font-bold leading-none tabular-nums",
                    info.status === "past" ? "text-muted-foreground/60" : "text-foreground",
                    isToday && "text-primary"
                  )}>{format(d, "d")}</span>
                  {info.status !== "past" && info.status !== "available" && (
                    <span className={cn("h-2 w-2 rounded-sm shrink-0", colors.dot)} />
                  )}
                </div>

                <div className="absolute inset-x-1.5 bottom-1.5 space-y-1">
                  <div className={cn("text-[9px] lg:text-[10px] font-bold leading-none truncate", colors.text)}>
                    {!isOtherMonth && colors.shortLabel}
                  </div>
                  {info.status !== "past" && info.status !== "available" && (
                    <div className="hidden lg:flex gap-1">
                      <span className={cn("h-1.5 flex-1 rounded-sm", hasMorning ? colors.strip : "bg-muted")} />
                      <span className={cn("h-1.5 flex-1 rounded-sm", hasNight ? colors.strip : "bg-muted")} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <DaySheet
        date={selected}
        info={selectedInfo}
        hallName={selectedHall.name}
        morningPrice={selectedHall.morningPrice}
        nightPrice={selectedHall.nightPrice}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function SummaryBox({ label, value, tone }: { label: string; value: number; tone: "success" | "info" | "warning" | "destructive" }) {
  const toneClass = {
    success: "border-success/30 bg-success-soft/25 text-success",
    info: "border-info/30 bg-info-soft/25 text-info",
    warning: "border-warning/35 bg-warning-soft/35 text-warning",
    destructive: "border-destructive/30 bg-destructive-soft/25 text-destructive",
  }[tone];
  return (
    <div className={cn("rounded-md border px-2.5 py-2", toneClass)}>
      <div className="text-[10px] uppercase tracking-wide font-bold truncate">{label}</div>
      <div className="text-xl font-serif-display font-bold leading-none mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-1.5 w-1.5 rounded-sm", color)} />
      {label}
    </span>
  );
}

function DaySheet({ date, info, hallName, morningPrice, nightPrice, onClose }: any) {
  const [tab, setTab] = useState("status");
  const [slot, setSlot] = useState<"morning" | "night">("morning");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [dayBlocked, setDayBlocked] = useState(false);
  const [nightBlocked, setNightBlocked] = useState(false);

  const handleOfflineBook = () => {
    if (!name) { toast.error("Customer name required"); return; }
    toast.success("Offline booking confirmed", { description: `${name} • ${slot === "morning" ? "Day" : "Night"} slot` });
    onClose();
  };

  return (
    <Sheet open={!!date} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-lg p-0 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="px-5 py-4 border-b border-border text-left flex flex-row items-start justify-between">
          <div>
            <SheetTitle className="font-serif-display text-lg">
              {date && format(parseISO(date), "EEEE, d MMMM")}
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{hallName}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md bg-muted flex items-center justify-center tap-target" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>

        {info?.bookings.length > 0 && (() => {
          const online = info.bookings.filter((b: any) => b.source === "online");
          const offline = info.bookings.filter((b: any) => b.source === "offline");
          return (
            <div className="px-5 py-4 space-y-3 border-b border-border">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold">Bookings on this date</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-info/25 bg-info-soft text-info flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {online.length}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-accent/25 bg-accent-soft text-accent flex items-center gap-1">
                    <Store className="h-3 w-3" /> {offline.length}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {info.bookings.map((b: any) => <BookingRow key={b.id} b={b} />)}
              </div>
            </div>
          );
        })()}

        <Tabs value={tab} onValueChange={setTab} className="px-5 pt-4 pb-6">
          <TabsList className="grid grid-cols-2 w-full bg-muted rounded-md h-10 p-1">
            <TabsTrigger value="status" className="rounded-sm">Slot Status</TabsTrigger>
            <TabsTrigger value="offline" className="rounded-sm">Offline Booking</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-3 mt-4">
            <div className="rounded-md bg-card border border-border p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-sm bg-warning" /> Day Slot</div>
                <p className="text-xs text-muted-foreground mt-1">{dayBlocked ? "Blocked manually" : "Available for booking"}</p>
              </div>
              <Switch checked={!dayBlocked} onCheckedChange={(v) => setDayBlocked(!v)} />
            </div>
            <div className="rounded-md bg-card border border-border p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-sm bg-info" /> Night Slot</div>
                <p className="text-xs text-muted-foreground mt-1">{nightBlocked ? "Blocked manually" : "Available for booking"}</p>
              </div>
              <Switch checked={!nightBlocked} onCheckedChange={(v) => setNightBlocked(!v)} />
            </div>
            <Button onClick={() => { toast.success("Availability updated"); onClose(); }} className="w-full h-11 rounded-md bg-primary tap-target">Save Changes</Button>
          </TabsContent>

          <TabsContent value="offline" className="space-y-3 mt-4">
            <div className="rounded-md border border-warning/30 bg-warning-soft/35 text-warning p-3 text-xs">
              Offline booking will block this slot on the customer app.
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Select Slot</Label>
              <select value={slot} onChange={(e) => setSlot(e.target.value as any)} className="w-full h-11 mt-1.5 rounded-md bg-card border border-border px-3 text-sm">
                <option value="morning">Day Slot — {formatINR(morningPrice)}</option>
                <option value="night">Night Slot — {formatINR(nightPrice)}</option>
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Customer Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" className="h-11 mt-1.5 rounded-md" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 xxxxx xxxxx" className="h-11 mt-1.5 rounded-md" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Total Amount</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder={`Default: ${slot === "morning" ? morningPrice : nightPrice}`} className="h-11 mt-1.5 rounded-md" />
            </div>
            <Button onClick={handleOfflineBook} className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold tap-target">
              Confirm Offline Booking
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function BookingRow({ b }: { b: any }) {
  const paid = (b.payments?.reduce((s: number, p: any) => s + p.amount, 0)) ?? b.advancePaid;
  const bal = b.amount - paid;
  const ps: "unpaid" | "partial" | "paid" = paid <= 0 ? "unpaid" : bal <= 0 ? "paid" : "partial";
  const SlotIcon = b.slot === "morning" ? Sun : Moon;
  return (
    <Link
      to={`/bookings/${b.id}`}
      className="rounded-md bg-card border border-border p-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
    >
      <div className={cn(
        "h-9 w-9 rounded-md flex items-center justify-center shrink-0",
        b.slot === "morning" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"
      )}>
        <SlotIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm truncate">{b.customerName}</span>
          <span className={cn(
            "shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase flex items-center gap-1",
            b.source === "online" ? "bg-info-soft text-info border-info/25" : "bg-accent-soft text-accent border-accent/25"
          )}>
            {b.source === "online" ? <Globe className="h-2.5 w-2.5" /> : <Store className="h-2.5 w-2.5" />}
            {b.source}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span>{b.slot === "morning" ? "Day Slot" : "Night Slot"}</span>
          <span>•</span>
          <span className="font-semibold text-foreground">{formatINR(b.amount)}</span>
          <span>•</span>
          <span className={cn(
            "font-semibold",
            b.status === "confirmed" && "text-success",
            b.status === "pending" && "text-warning",
            b.status === "offline" && "text-accent",
          )}>{b.status}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className={cn(
            "rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
            ps === "paid" && "bg-success-soft text-success border-success/30",
            ps === "partial" && "bg-warning-soft text-warning border-warning/35",
            ps === "unpaid" && "bg-destructive-soft text-destructive border-destructive/30",
          )}>
            {ps === "paid" ? "Paid" : ps === "partial" ? `Bal ${formatINR(bal)}` : "Unpaid"}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">#{b.id}</span>
        </div>
      </div>
      <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0" aria-label="Call customer">
        <Phone className="h-3.5 w-3.5" />
      </a>
      <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-md bg-success-soft text-success flex items-center justify-center shrink-0" aria-label="WhatsApp customer">
        <MessageCircle className="h-3.5 w-3.5" />
      </a>
      <ChevRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
