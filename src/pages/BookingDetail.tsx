import { useParams, Link, useNavigate } from "react-router-dom";
import { bookings, halls, formatINR, type PaymentEntry, type PaymentMethod } from "@/data/mock";
import { generateBookingConfirmationPdf } from "@/lib/bookingPdf";
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, FileDown, CheckCircle2, XCircle, Building2, User, Hash, Plus, Banknote, Smartphone, CreditCard, Landmark, FileText, Trash2, Globe, Store, Ban, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const methodMeta: Record<PaymentMethod, { label: string; icon: typeof Banknote; color: string }> = {
  cash: { label: "Cash", icon: Banknote, color: "text-success bg-success-soft" },
  upi: { label: "UPI", icon: Smartphone, color: "text-info bg-info-soft" },
  card: { label: "Card", icon: CreditCard, color: "text-primary bg-primary-soft" },
  bank: { label: "Bank Transfer", icon: Landmark, color: "text-accent bg-accent-soft" },
  cheque: { label: "Cheque", icon: FileText, color: "text-warning bg-warning-soft" },
};

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const b = bookings.find((x) => x.id === id);
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  // Payment dialog state
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("upi");
  const [payNote, setPayNote] = useState("");
  const [payRef, setPayRef] = useState("");

  const payments: PaymentEntry[] = useMemo(() => {
    if (!b) return [];
    if (b.payments) return b.payments;
    // Seed initial advance as a payment entry
    if (b.advancePaid > 0) {
      b.payments = [{
        id: "P0",
        amount: b.advancePaid,
        method: b.source === "offline" ? "cash" : "upi",
        date: b.createdAt,
        note: "Advance payment",
      }];
      return b.payments;
    }
    b.payments = [];
    return b.payments;
  }, [b]);

  if (!b) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Booking not found</p>
        <Button asChild variant="link"><Link to="/bookings">Back to bookings</Link></Button>
      </div>
    );
  }

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = b.amount - totalPaid;
  const paymentStatus: "unpaid" | "partial" | "paid" = totalPaid <= 0 ? "unpaid" : balance <= 0 ? "paid" : "partial";

  const handleConfirm = () => {
    b.status = "confirmed";
    refresh();
    try {
      const hall = halls.find((h) => h.id === b.hallId);
      generateBookingConfirmationPdf(b, hall);
      toast.success("Booking confirmed", { description: "Confirmation PDF downloaded." });
    } catch {
      toast.success("Booking confirmed", { description: `${b.customerName} has been notified.` });
    }
  };
  const handleReject = () => {
    b.status = "rejected";
    refresh();
    toast.error("Booking rejected", { description: `${b.customerName} has been notified.` });
  };
  const handleCancel = () => {
    b.status = "cancelled";
    refresh();
    toast.error("Booking cancelled", { description: `Booking #${b.id} has been cancelled.` });
  };
  const handleMarkCompleted = () => {
    b.status = "completed";
    refresh();
    toast.success("Booking marked as completed");
  };

  const addPayment = () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > balance) {
      toast.error(`Amount exceeds balance of ${formatINR(balance)}`);
      return;
    }
    const entry: PaymentEntry = {
      id: `P${Date.now()}`,
      amount: amt,
      method: payMethod,
      date: new Date().toISOString().slice(0, 10),
      note: payNote || undefined,
      reference: payRef || undefined,
    };
    b.payments = [...payments, entry];
    b.advancePaid = (b.advancePaid || 0) + amt;
    setPayAmount("");
    setPayNote("");
    setPayRef("");
    setPayOpen(false);
    refresh();
    toast.success(`Payment of ${formatINR(amt)} recorded`, { description: `via ${methodMeta[payMethod].label}` });
  };

  const removePayment = (pid: string) => {
    const removed = payments.find((p) => p.id === pid);
    if (!removed) return;
    b.payments = payments.filter((p) => p.id !== pid);
    b.advancePaid = Math.max(0, (b.advancePaid || 0) - removed.amount);
    refresh();
    toast.success("Payment entry removed");
  };

  const buildReceipt = () => {
    const lines = [
      `*VenueHub Receipt*`,
      `Booking: #${b.id}`,
      `Customer: ${b.customerName}`,
      `Hall: ${b.hallName}`,
      `Date: ${format(parseISO(b.date), "d MMM yyyy")} • ${b.slot === "morning" ? "Day" : "Night"}`,
      ``,
      `Total: ${formatINR(b.amount)}`,
      `Paid: ${formatINR(totalPaid)}`,
      `Balance: ${formatINR(balance)}`,
      ``,
      `Status: ${b.status.toUpperCase()} • Payment: ${paymentStatus.toUpperCase()}`,
    ];
    return lines.join("\n");
  };

  const shareWA = () => {
    const msg = encodeURIComponent(buildReceipt());
    window.open(`https://wa.me/${b.customerPhone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground px-5 lg:px-8 pt-5 pb-8 lg:rounded-b-3xl">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm tap-target">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "chip uppercase text-[10px] tracking-wide flex items-center gap-1",
              b.source === "online" ? "bg-info text-info-foreground" : "bg-white/20 text-white"
            )}>
              {b.source === "online" ? <Globe className="h-3 w-3" /> : <Store className="h-3 w-3" />}
              {b.source}
            </span>
            <span className={cn(
              "chip uppercase text-[10px] tracking-wide",
              b.status === "confirmed" && "bg-success text-success-foreground",
              b.status === "pending" && "bg-warning text-accent-foreground",
              b.status === "completed" && "bg-info text-info-foreground",
              b.status === "rejected" && "bg-destructive text-destructive-foreground",
              b.status === "cancelled" && "bg-destructive text-destructive-foreground",
              b.status === "offline" && "bg-white/20 text-white",
            )}>{b.status}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Booking Detail</p>
          <h1 className="font-display font-bold text-2xl mt-1">#{b.id}</h1>
          <p className="text-sm opacity-80 mt-1">Created {format(parseISO(b.createdAt), "d MMM yyyy")}</p>
        </div>
      </div>

      <div className="px-4 lg:px-8 -mt-5 space-y-4">
        {/* Pending action buttons */}
        {b.status === "pending" && (
          <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-card border border-border/50 p-3 shadow-card">
            <Button onClick={handleConfirm} className="h-12 rounded-xl bg-success hover:bg-success/90 text-white font-semibold tap-target">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm
            </Button>
            <Button onClick={handleReject} variant="outline" className="h-12 rounded-xl border-destructive text-destructive hover:bg-destructive-soft font-semibold tap-target">
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </Button>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2.5">
          <a href={`tel:${b.customerPhone}`} className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-card transition-all tap-target">
            <div className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center"><Phone className="h-4 w-4" /></div>
            <span className="text-xs font-semibold">Call</span>
          </a>
          <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-card transition-all tap-target">
            <div className="h-10 w-10 rounded-full bg-success-soft text-success flex items-center justify-center"><MessageCircle className="h-4 w-4" /></div>
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>
          <button onClick={shareWA} className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-card transition-all tap-target">
            <div className="h-10 w-10 rounded-full bg-accent-soft text-accent flex items-center justify-center"><Receipt className="h-4 w-4" /></div>
            <span className="text-xs font-semibold">Share Receipt</span>
          </button>
        </div>

        {/* Customer card */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 text-xs uppercase tracking-wide text-muted-foreground font-bold">Customer Info</div>
          <div className="p-5 space-y-3">
            <Row icon={User} label="Name" value={b.customerName} />
            <Row icon={Phone} label="Phone" value={b.customerPhone} />
            <Row icon={MapPin} label="Address" value={b.customerAddress} />
          </div>
        </div>

        {/* Service card */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 text-xs uppercase tracking-wide text-muted-foreground font-bold">Service Details</div>
          <div className="p-5 space-y-3">
            <Row icon={Building2} label="Hall" value={b.hallName} />
            <Row icon={Calendar} label="Date" value={format(parseISO(b.date), "EEEE, d MMM yyyy")} />
            <Row icon={Hash} label="Slot" value={b.slot === "morning" ? "Day / Morning" : "Night / Evening"} />
            <Row icon={b.source === "online" ? Globe : Store} label="Booking Source" value={b.source === "online" ? "Online (Customer App)" : "Offline (Walk-in / Manual)"} />
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Payment Summary</span>
            <span className={cn(
              "chip uppercase text-[10px] tracking-wide font-bold",
              paymentStatus === "paid" && "bg-success-soft text-success",
              paymentStatus === "partial" && "bg-warning-soft text-warning",
              paymentStatus === "unpaid" && "bg-destructive-soft text-destructive",
            )}>
              {paymentStatus === "paid" ? "Fully Paid" : paymentStatus === "partial" ? "Partial" : "Unpaid"}
            </span>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Total</div>
                <div className="font-display font-bold text-base mt-1">{formatINR(b.amount)}</div>
              </div>
              <div className="rounded-xl bg-success-soft p-3">
                <div className="text-[10px] uppercase tracking-wide text-success font-semibold">Paid</div>
                <div className="font-display font-bold text-base mt-1 text-success">{formatINR(totalPaid)}</div>
              </div>
              <div className={cn("rounded-xl p-3", balance > 0 ? "bg-destructive-soft" : "bg-muted/50")}>
                <div className={cn("text-[10px] uppercase tracking-wide font-semibold", balance > 0 ? "text-destructive" : "text-muted-foreground")}>Balance</div>
                <div className={cn("font-display font-bold text-base mt-1", balance > 0 ? "text-destructive" : "text-muted-foreground")}>{formatINR(balance)}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full transition-all", paymentStatus === "paid" ? "bg-success" : "bg-warning")}
                  style={{ width: `${Math.min(100, (totalPaid / b.amount) * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5 text-center">
                {Math.round((totalPaid / b.amount) * 100)}% collected
              </div>
            </div>

            {/* Add payment */}
            {balance > 0 && b.status !== "rejected" && b.status !== "cancelled" && (
              <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold tap-target">
                    <Plus className="h-4 w-4 mr-1.5" /> Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label className="text-xs">Amount Received</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder={`Max ${formatINR(balance)}`}
                        className="h-11 mt-1.5"
                        autoFocus
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        {[balance, Math.round(balance / 2), 5000, 10000].filter((v, i, a) => v > 0 && v <= balance && a.indexOf(v) === i).slice(0, 4).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setPayAmount(String(v))}
                            className="text-[11px] px-2 py-1 rounded-md bg-muted hover:bg-primary-soft hover:text-primary font-semibold"
                          >
                            {formatINR(v)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Payment Method</Label>
                      <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
                        <SelectTrigger className="h-11 mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(methodMeta) as PaymentMethod[]).map((m) => (
                            <SelectItem key={m} value={m}>{methodMeta[m].label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Reference / Txn ID (optional)</Label>
                      <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="UPI ref, cheque no..." className="h-11 mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-xs">Note (optional)</Label>
                      <Textarea value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Any remarks..." className="mt-1.5" rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
                    <Button onClick={addPayment}>Save Payment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Payment History</span>
            <span className="text-[11px] text-muted-foreground font-semibold">{payments.length} entries</span>
          </div>
          <div className="divide-y divide-border/50">
            {payments.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No payments recorded yet</div>
            )}
            {payments.map((p) => {
              const meta = methodMeta[p.method];
              const Icon = meta.icon;
              return (
                <div key={p.id} className="p-4 flex items-start gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", meta.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-sm">{meta.label}</span>
                      <span className="font-display font-bold text-success">+{formatINR(p.amount)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {format(parseISO(p.date), "d MMM yyyy")}
                      {p.reference && <> • Ref: {p.reference}</>}
                    </div>
                    {p.note && <div className="text-xs text-muted-foreground mt-1 italic">"{p.note}"</div>}
                  </div>
                  <button
                    onClick={() => removePayment(p.id)}
                    className="h-8 w-8 rounded-md hover:bg-destructive-soft text-muted-foreground hover:text-destructive flex items-center justify-center tap-target"
                    aria-label="Remove payment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking management */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 text-xs uppercase tracking-wide text-muted-foreground font-bold">Manage Booking</div>
          <div className="p-3 grid grid-cols-2 gap-2">
            <Button onClick={shareWA} variant="outline" className="h-11 rounded-xl font-semibold tap-target">
              <FileDown className="h-4 w-4 mr-1.5" /> Share Receipt
            </Button>
            {b.status === "confirmed" && (
              <Button onClick={handleMarkCompleted} variant="outline" className="h-11 rounded-xl border-info text-info hover:bg-info-soft font-semibold tap-target">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Completed
              </Button>
            )}
            {(b.status === "confirmed" || b.status === "pending" || b.status === "offline") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="h-11 rounded-xl border-destructive text-destructive hover:bg-destructive-soft font-semibold tap-target col-span-2">
                    <Ban className="h-4 w-4 mr-1.5" /> Cancel Booking
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Booking #{b.id} for {b.customerName} on {format(parseISO(b.date), "d MMM yyyy")} will be cancelled. The slot will become available again. {totalPaid > 0 && `A refund of ${formatINR(totalPaid)} may be due.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">Yes, Cancel</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {b.notes && (
          <div className="rounded-2xl bg-warning-soft border border-warning/30 p-4">
            <div className="text-[10px] uppercase tracking-wide font-bold text-warning mb-1">Internal Note</div>
            <p className="text-sm">{b.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
        <div className="font-semibold text-sm break-words">{value}</div>
      </div>
    </div>
  );
}
