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
                  <Button variant="outline" className="rounded-xl h-11 tap-target">
                    <Edit className="h-4 w-4 mr-2" /> Edit Hall
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
