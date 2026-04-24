import { halls, formatINR, reviews } from "@/data/mock";
import { Building2, Calendar, Edit, Star, MapPin, Users, Plus, TrendingUp, Mail, Phone, MessageCircle } from "lucide-react";
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
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl">My Halls</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your properties, pricing, and availability</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="rounded-full h-11 bg-primary shadow-glow tap-target">
          <Plus className="h-4 w-4 mr-1" /> Add Hall
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((h) => {
          const hallReviews = reviews.filter((r) => r.hallId === h.id);
          return (
            <div key={h.id} className="rounded-3xl bg-card border border-border/50 overflow-hidden shadow-card group">
              {/* Cover */}
              <div className="relative h-44 bg-gradient-hero">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Building2 className="h-24 w-24 text-primary-foreground" />
                </div>
                <div className="absolute top-3 left-3 chip bg-white/95 text-foreground backdrop-blur-sm">
                  <span className={`h-1.5 w-1.5 rounded-full ${h.active ? "bg-success" : "bg-muted-foreground"}`} />
                  {h.active ? "ACTIVE" : "INACTIVE"}
                </div>
                <div className="absolute top-3 right-3">
                  <Switch checked={h.active} onCheckedChange={() => toggle(h.id)} className="data-[state=checked]:bg-success" />
                </div>
                <div className="absolute bottom-3 right-3 chip bg-white/95 backdrop-blur-sm text-foreground">
                  <Users className="h-3 w-3" /> {h.capacity.toLocaleString()}
                </div>
              </div>

              <div className="p-4 lg:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-lg truncate">{h.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" /> {h.address}, {h.city}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-bold">{h.rating}</span>
                    <span className="text-xs text-muted-foreground">({hallReviews.length})</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Bookings</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display font-bold text-lg">{h.bookingsThisMonth}</span>
                      <span className="text-[10px] text-success font-semibold flex items-center"><TrendingUp className="h-2.5 w-2.5 mr-0.5" />12%</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Revenue</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display font-bold text-lg">{formatINR(h.revenueThisMonth)}</span>
                      <span className="text-[10px] text-success font-semibold flex items-center"><TrendingUp className="h-2.5 w-2.5 mr-0.5" />8%</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-warning-soft text-warning px-3 py-2">
                    <span className="opacity-80">Day:</span> <span className="font-bold">{formatINR(h.morningPrice)}</span>
                  </div>
                  <div className="rounded-lg bg-info-soft text-info px-3 py-2">
                    <span className="opacity-80">Night:</span> <span className="font-bold">{formatINR(h.nightPrice)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Button asChild className="rounded-xl h-11 bg-foreground text-background hover:bg-foreground/90 tap-target">
                    <Link to="/calendar"><Calendar className="h-4 w-4 mr-2" /> Calendar</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl h-11 tap-target">
                    <Link to={`/halls/${h.id}/edit`}><Edit className="h-4 w-4 mr-2" /> Edit Hall</Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Hall — Contact Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center font-display text-xl">Contact App Admin</DialogTitle>
            <DialogDescription className="text-center">
              To add a new hall to your account, please contact our admin team. They will verify your property details and onboard it within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <a
              href="tel:+919999999999"
              className="flex items-center gap-3 rounded-xl bg-muted/50 hover:bg-muted px-4 py-3 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-success/15 flex items-center justify-center">
                <Phone className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Call Admin</div>
                <div className="text-sm font-semibold">+91 99999 99999</div>
              </div>
            </a>
            <a
              href="https://wa.me/919999999999?text=Hi,%20I%20want%20to%20add%20a%20new%20hall%20to%20my%20BookMyHall%20account."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl bg-muted/50 hover:bg-muted px-4 py-3 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-success/15 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">WhatsApp</div>
                <div className="text-sm font-semibold">+91 99999 99999</div>
              </div>
            </a>
            <a
              href="mailto:admin@bookmyhall.app?subject=Add%20New%20Hall%20Request"
              className="flex items-center gap-3 rounded-xl bg-muted/50 hover:bg-muted px-4 py-3 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-info/15 flex items-center justify-center">
                <Mail className="h-4 w-4 text-info" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="text-sm font-semibold">admin@bookmyhall.app</div>
              </div>
            </a>
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full rounded-xl h-11" onClick={() => setShowAddDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
