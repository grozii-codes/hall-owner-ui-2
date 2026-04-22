import { useParams, Link, useNavigate } from "react-router-dom";
import { bookings, formatINR } from "@/data/mock";
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, IndianRupee, FileDown, CheckCircle2, XCircle, Building2, User, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const b = bookings.find((x) => x.id === id);

  if (!b) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Booking not found</p>
        <Button asChild variant="link"><Link to="/bookings">Back to bookings</Link></Button>
      </div>
    );
  }

  const handleConfirm = () => {
    b.status = "confirmed";
    toast.success("Booking confirmed", { description: `${b.customerName} has been notified.` });
  };
  const handleReject = () => {
    b.status = "rejected";
    toast.error("Booking rejected", { description: `${b.customerName} has been notified.` });
  };
  const shareWA = () => {
    const msg = encodeURIComponent(`Hi ${b.customerName}, your booking #${b.id} at ${b.hallName} on ${format(parseISO(b.date), "d MMM yyyy")} (${b.slot}) is ${b.status}. Total: ${formatINR(b.amount)}, Advance: ${formatINR(b.advancePaid)}, Balance: ${formatINR(b.amount - b.advancePaid)}.`);
    window.open(`https://wa.me/${b.customerPhone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  const balance = b.amount - b.advancePaid;

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground px-5 lg:px-8 pt-5 pb-8 lg:rounded-b-3xl">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm tap-target">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className={cn(
            "chip uppercase text-[10px] tracking-wide",
            b.status === "confirmed" && "bg-success text-success-foreground",
            b.status === "pending" && "bg-warning text-accent-foreground",
            b.status === "completed" && "bg-info text-info",
            b.status === "rejected" && "bg-destructive text-destructive-foreground",
          )}>{b.status}</span>
        </div>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Booking Detail</p>
          <h1 className="font-display font-bold text-2xl mt-1">#{b.id}</h1>
          <p className="text-sm opacity-80 mt-1">Created {format(parseISO(b.createdAt), "d MMM yyyy")}</p>
        </div>
      </div>

      <div className="px-4 lg:px-8 -mt-5 space-y-4">
        {/* Action buttons */}
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
            <div className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center"><Phone className="h-4.5 w-4.5" /></div>
            <span className="text-xs font-semibold">Call</span>
          </a>
          <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-card transition-all tap-target">
            <div className="h-10 w-10 rounded-full bg-success-soft text-success flex items-center justify-center"><MessageCircle className="h-4.5 w-4.5" /></div>
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>
          <button onClick={shareWA} className="rounded-2xl bg-card border border-border/50 p-3 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-card transition-all tap-target">
            <div className="h-10 w-10 rounded-full bg-accent-soft text-accent flex items-center justify-center"><FileDown className="h-4.5 w-4.5" /></div>
            <span className="text-xs font-semibold">Share Invoice</span>
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
          </div>
        </div>

        {/* Invoice */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 text-xs uppercase tracking-wide text-muted-foreground font-bold flex items-center justify-between">
            <span>Payment</span>
            <span className={`chip ${b.source === "online" ? "bg-info-soft text-info" : "bg-accent-soft text-accent"}`}>{b.source}</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">{formatINR(b.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Advance Paid</span>
              <span className="font-semibold text-success">{formatINR(b.advancePaid)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Balance Due</span>
              <span className="font-display font-bold text-xl text-destructive">{formatINR(balance)}</span>
            </div>
          </div>
        </div>

        <Button onClick={() => toast.success("Receipt downloaded")} className="w-full h-13 rounded-2xl bg-foreground text-background font-semibold py-4 tap-target">
          <FileDown className="h-4 w-4 mr-2" /> Download PDF Receipt
        </Button>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: any) {
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
