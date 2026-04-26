import { halls, formatINR, reviews } from "@/data/mock";
import { Building2, Calendar, Edit, Star, MapPin, Users, Plus, Mail, Phone, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function Halls() {
  const [list, setList] = useState(halls);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const toggle = (id: string) => {
    setList((l) => l.map((h) => h.id === id ? { ...h, active: !h.active } : h));
    toast.success("Hall status updated");
  };

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif-display text-2xl lg:text-3xl">My Halls</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage properties, pricing & availability</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="rounded-md h-10 px-4 bg-primary tap-target">
          <Plus className="h-4 w-4 mr-1.5" /> Add Hall
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((h) => {
          const hallReviews = reviews.filter((r) => r.hallId === h.id);
          return (
            <div key={h.id} className="rounded-md bg-card border border-border overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full ${h.active ? "bg-success" : "bg-muted-foreground"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${h.active ? "text-success" : "text-muted-foreground"}`}>
                    {h.active ? "Active · Accepting bookings" : "Paused · Hidden from customers"}
                  </span>
                </div>
                <Switch checked={h.active} onCheckedChange={() => toggle(h.id)} />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-serif-display font-bold text-lg leading-tight truncate">{h.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {h.address}, {h.city}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-bold tabular-nums">{h.rating}</span>
                    <span className="text-xs text-muted-foreground">({hallReviews.length})</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <InfoBox label="Capacity" value={`${h.capacity.toLocaleString()}`} icon={<Users className="h-3 w-3" />} />
                  <InfoBox label="Type" value={h.hallType ?? h.category} />
                  <InfoBox label="Food" value={h.foodType} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Day slot</div>
                    <div className="font-serif-display font-bold text-base tabular-nums mt-0.5">{formatINR(h.morningPrice)}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Night slot</div>
                    <div className="font-serif-display font-bold text-base tabular-nums mt-0.5">{formatINR(h.nightPrice)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-md border border-border px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Bookings (mo)</div>
                    <div className="font-serif-display font-bold text-base tabular-nums mt-0.5">{h.bookingsThisMonth}</div>
                  </div>
                  <div className="rounded-md border border-border px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Revenue (mo)</div>
                    <div className="font-serif-display font-bold text-base tabular-nums mt-0.5">{formatINR(h.revenueThisMonth)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button asChild variant="outline" className="rounded-md h-10 tap-target">
                    <Link to="/calendar"><Calendar className="h-4 w-4 mr-1.5" /> Calendar</Link>
                  </Button>
                  <Button asChild className="rounded-md h-10 bg-primary tap-target">
                    <Link to={`/halls/${h.id}/edit`}><Edit className="h-4 w-4 mr-1.5" /> Edit</Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm rounded-md">
          <DialogHeader>
            <div className="mx-auto h-12 w-12 rounded-md bg-primary-soft flex items-center justify-center mb-2">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center font-serif-display text-xl">Contact Admin</DialogTitle>
            <DialogDescription className="text-center">
              To add a new hall, contact our admin team. Verification & onboarding completed within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <a href="tel:+919999999999" className="flex items-center gap-3 rounded-md border border-border hover:bg-muted/40 px-3 py-2.5 transition">
              <div className="h-9 w-9 rounded-md bg-success-soft flex items-center justify-center">
                <Phone className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Call</div>
                <div className="text-sm font-semibold">+91 99999 99999</div>
              </div>
            </a>
            <a href="https://wa.me/919999999999?text=Hi,%20I%20want%20to%20add%20a%20new%20hall." target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md border border-border hover:bg-muted/40 px-3 py-2.5 transition">
              <div className="h-9 w-9 rounded-md bg-success-soft flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">WhatsApp</div>
                <div className="text-sm font-semibold">+91 99999 99999</div>
              </div>
            </a>
            <a href="mailto:admin@bookmyhall.app?subject=Add%20New%20Hall%20Request" className="flex items-center gap-3 rounded-md border border-border hover:bg-muted/40 px-3 py-2.5 transition">
              <div className="h-9 w-9 rounded-md bg-info-soft flex items-center justify-center">
                <Mail className="h-4 w-4 text-info" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Email</div>
                <div className="text-sm font-semibold">admin@bookmyhall.app</div>
              </div>
            </a>
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full rounded-md h-10" onClick={() => setShowAddDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoBox({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border px-2 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-xs font-semibold mt-0.5 truncate">{value}</div>
    </div>
  );
}
