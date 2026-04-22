import { customers, formatINR } from "@/data/mock";
import { Phone, MessageCircle, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format, parseISO } from "date-fns";

export default function Customers() {
  const [q, setQ] = useState("");
  const list = customers.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">Customers</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{customers.length} customers across your halls</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone..." className="pl-10 h-12 rounded-2xl bg-card border-border/60" />
      </div>

      <div className="space-y-2.5">
        {list.map((c) => (
          <div key={c.id} className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg shrink-0 shadow-glow">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{c.address}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.phone}</div>
                <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-3 text-xs">
                    <span><span className="font-bold">{c.totalBookings}</span> <span className="text-muted-foreground">bookings</span></span>
                    <span className="font-bold text-primary">{formatINR(c.totalSpent)}</span>
                    <span className="text-muted-foreground">Last: {format(parseISO(c.lastBooking), "d MMM")}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <a href={`tel:${c.phone}`} className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center tap-target">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" className="h-8 w-8 rounded-full bg-success-soft text-success flex items-center justify-center tap-target">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
