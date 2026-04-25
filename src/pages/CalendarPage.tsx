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

// Each status gets a strong, identifiable visual — fill, border, text color
const statusColors: Record<string, {
  dot: string; chip: string; label: string; cellBg: string; cellBorder: string; dayText: string; shortLabel: string;
}> = {
  available:      { dot: "bg-success",     chip: "bg-success text-success-foreground",         label: "Available",      cellBg: "bg-success-soft/60",     cellBorder: "border-success/50",     dayText: "text-success",       shortLabel: "Free" },
  "morning-only": { dot: "bg-info",        chip: "bg-info text-info-foreground",               label: "Partial (Day)",  cellBg: "bg-info-soft/70",        cellBorder: "border-info/60",        dayText: "text-info",          shortLabel: "Partial" },
  "night-only":   { dot: "bg-info",        chip: "bg-info text-info-foreground",               label: "Partial (Night)",cellBg: "bg-info-soft/70",        cellBorder: "border-info/60",        dayText: "text-info",          shortLabel: "Partial" },
  pending:        { dot: "bg-warning",     chip: "bg-warning text-accent-foreground",          label: "Pending",        cellBg: "bg-warning/35",          cellBorder: "border-warning",        dayText: "text-warning",       shortLabel: "Pending" },
  full:           { dot: "bg-destructive", chip: "bg-destructive text-destructive-foreground", label: "Fully Booked",   cellBg: "bg-destructive/20",      cellBorder: "border-destructive/70", dayText: "text-destructive",   shortLabel: "Booked" },
  past:           { dot: "bg-muted",       chip: "bg-muted text-muted-foreground",             label: "Past",           cellBg: "bg-muted/20",            cellBorder: "border-transparent",    dayText: "text-muted-foreground/50", shortLabel: "" },
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

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl">Calendar</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track availability & manage offline bookings</p>
        </div>
        <select
          value={hallId}
          onChange={(e) => setHallId(e.target.value)}
          className="h-11 rounded-xl bg-card border border-border/60 px-4 text-sm font-semibold"
        >
          {halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 text-xs">
        {(["available", "morning-only", "night-only", "pending", "full"] as const).map((k) => (
          <div key={k} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border", statusColors[k].cellBg, statusColors[k].cellBorder)}>
            <span className={cn("h-2.5 w-2.5 rounded-sm", statusColors[k].dot)} />
            <span className={cn("font-bold text-[11px]", statusColors[k].dayText)}>{statusColors[k].label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 lg:px-5 py-4 border-b border-border/50">
          <button onClick={() => setCursor(addMonths(cursor, -1))} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center tap-target">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="font-display font-bold text-lg">{format(cursor, "MMMM yyyy")}</h3>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center tap-target">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 px-1 lg:px-2 py-2 text-[10px] lg:text-xs uppercase font-bold tracking-wider text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 px-1.5 lg:px-2 pb-2">
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
                  "relative min-h-[64px] lg:min-h-[88px] rounded-lg p-1 lg:p-1.5 flex flex-col items-stretch text-left transition-all tap-target border-2 overflow-hidden",
                  colors.cellBg,
                  colors.cellBorder,
                  isOtherMonth && "opacity-30",
                  info.status === "past" && "cursor-not-allowed",
                  info.status !== "past" && "hover:brightness-95 active:scale-[0.97]",
                  isToday && "ring-2 ring-primary ring-offset-1"
                )}
              >
                {/* Date */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[13px] lg:text-sm font-bold leading-none",
                    info.status !== "past" ? colors.dayText : "text-muted-foreground/60",
                    isToday && "h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs"
                  )}>{format(d, "d")}</span>

                  {/* Slot icons - quick visual of which slot is booked */}
                  {info.status !== "past" && info.status !== "available" && (
                    <div className="flex items-center gap-0.5">
                      {hasMorning && <Sun className="h-2.5 w-2.5 text-warning" strokeWidth={3} />}
                      {hasNight && <Moon className="h-2.5 w-2.5 text-info" strokeWidth={3} />}
                    </div>
                  )}
                </div>

                {/* Status pill at bottom */}
                {info.status !== "past" && info.status !== "available" && (
                  <div className={cn("mt-auto text-[8px] lg:text-[10px] font-bold rounded px-1 py-0.5 text-center leading-tight uppercase tracking-wider", colors.chip)}>
                    {colors.shortLabel}
                  </div>
                )}
                {info.status === "available" && !isOtherMonth && (
                  <div className="mt-auto text-[8px] lg:text-[10px] font-bold text-success/70 text-center uppercase tracking-wider">
                    Free
                  </div>
                )}
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
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="px-5 py-4 border-b text-left flex flex-row items-start justify-between">
          <div>
            <SheetTitle className="font-display text-lg">
              {date && format(parseISO(date), "EEEE, d MMMM")}
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{hallName}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center tap-target">
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>

        {/* Existing bookings — Online vs Offline split */}
        {info?.bookings.length > 0 && (() => {
          const online = info.bookings.filter((b: any) => b.source === "online");
          const offline = info.bookings.filter((b: any) => b.source === "offline");
          return (
            <div className="px-5 py-4 space-y-4 border-b">
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold">Bookings on this date</p>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-info-soft text-info flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {online.length} Online
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-soft text-accent flex items-center gap-1">
                  <Store className="h-3 w-3" /> {offline.length} Offline
                </span>
              </div>

              {online.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-bold text-info">
                    <Globe className="h-3 w-3" /> Online Bookings
                  </div>
                  {online.map((b: any) => <BookingRow key={b.id} b={b} />)}
                </div>
              )}

              {offline.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-bold text-accent">
                    <Store className="h-3 w-3" /> Offline Bookings
                  </div>
                  {offline.map((b: any) => <BookingRow key={b.id} b={b} />)}
                </div>
              )}
            </div>
          );
        })()}

        <Tabs value={tab} onValueChange={setTab} className="px-5 pt-4 pb-6">
          <TabsList className="grid grid-cols-2 w-full bg-muted rounded-full h-11 p-1">
            <TabsTrigger value="status" className="rounded-full">Manage Status</TabsTrigger>
            <TabsTrigger value="offline" className="rounded-full">Add Offline</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-3 mt-4">
            <div className="rounded-2xl bg-muted/40 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full bg-warning" /> Day Slot</div>
                <p className="text-xs text-muted-foreground mt-1">{dayBlocked ? "Blocked manually by you" : "Available for booking"}</p>
              </div>
              <Switch checked={!dayBlocked} onCheckedChange={(v) => setDayBlocked(!v)} />
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full bg-info" /> Night Slot</div>
                <p className="text-xs text-muted-foreground mt-1">{nightBlocked ? "Blocked manually by you" : "Available for booking"}</p>
              </div>
              <Switch checked={!nightBlocked} onCheckedChange={(v) => setNightBlocked(!v)} />
            </div>
            <Button onClick={() => { toast.success("Availability updated"); onClose(); }} className="w-full h-12 rounded-2xl bg-primary tap-target">Save Changes</Button>
          </TabsContent>

          <TabsContent value="offline" className="space-y-3 mt-4">
            <div className="rounded-2xl bg-warning-soft text-warning p-3 text-xs flex gap-2">
              <span>ⓘ</span>
              <span>Adding offline booking instantly blocks the slot on customer portal.</span>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Select Slot</Label>
              <select value={slot} onChange={(e) => setSlot(e.target.value as any)} className="w-full h-12 mt-1.5 rounded-xl bg-card border border-border px-4 text-sm">
                <option value="morning">Day / Morning Slot — {formatINR(morningPrice)}</option>
                <option value="night">Night / Evening Slot — {formatINR(nightPrice)}</option>
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Customer Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className="h-12 mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 xxxxx xxxxx" className="h-12 mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Total Agreed Amount (₹)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder={`Default: ${slot === "morning" ? morningPrice : nightPrice}`} className="h-12 mt-1.5 rounded-xl" />
            </div>
            <Button onClick={handleOfflineBook} className="w-full h-13 rounded-2xl bg-gradient-accent text-accent-foreground font-semibold py-4 tap-target shadow-glow">
              ⊕ Confirm Offline Booking
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
      className="rounded-xl bg-card border border-border/60 p-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
    >
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
        b.slot === "morning" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"
      )}>
        <SlotIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm truncate">{b.customerName}</span>
          <span className={cn(
            "shrink-0 chip uppercase text-[9px] tracking-wide flex items-center gap-1",
            b.source === "online" ? "bg-info-soft text-info" : "bg-accent-soft text-accent"
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
            "chip uppercase text-[9px] tracking-wide",
            ps === "paid" && "bg-success-soft text-success",
            ps === "partial" && "bg-warning-soft text-warning",
            ps === "unpaid" && "bg-destructive-soft text-destructive",
          )}>
            {ps === "paid" ? "Fully Paid" : ps === "partial" ? `Bal ${formatINR(bal)}` : "Unpaid"}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">#{b.id}</span>
        </div>
      </div>
      <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Phone className="h-3.5 w-3.5" />
      </a>
      <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-success-soft text-success flex items-center justify-center shrink-0">
        <MessageCircle className="h-3.5 w-3.5" />
      </a>
      <ChevRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
