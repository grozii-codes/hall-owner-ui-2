import { bookings, halls, formatINR, revenueTrend } from "@/data/mock";
import { Building2, Calendar, IndianRupee, TrendingUp, ArrowUpRight, ArrowRight, Phone, MessageCircle, Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

const StatCard = ({ icon: Icon, label, value, trend, accent }: any) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      {trend && (
        <span className="chip bg-success-soft text-success">
          <ArrowUpRight className="h-3 w-3" /> {trend}
        </span>
      )}
    </div>
    <div className="mt-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className="text-xl font-display font-bold mt-0.5">{value}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const totalRevenue = bookings.filter(b => b.status !== "rejected").reduce((s, b) => s + b.amount, 0);
  const monthBookings = bookings.filter(b => b.status !== "rejected").length;
  const pending = bookings.filter(b => b.status === "pending");
  const activeHalls = halls.filter(h => h.active).length;
  const totalRev = revenueTrend.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good morning, Kareem 👋</p>
          <h2 className="font-display font-bold text-2xl lg:text-3xl mt-0.5">Here's today's summary</h2>
        </div>
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex rounded-full">
          <Link to="/bookings">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatINR(totalRevenue)} trend="+12%" accent="bg-primary-soft text-primary" />
        <StatCard icon={Calendar} label="Bookings" value={monthBookings} trend="+8%" accent="bg-info-soft text-info" />
        <StatCard icon={Building2} label="Active Halls" value={activeHalls} accent="bg-accent-soft text-accent" />
        <StatCard icon={Clock} label="Pending Action" value={pending.length} accent="bg-warning-soft text-warning" />
      </div>

      {/* Revenue chart */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-hero text-primary-foreground p-5 lg:p-6 shadow-elevated relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">Revenue Trend (7 days)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="font-display font-bold text-3xl lg:text-4xl">{formatINR(totalRev)}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success-soft font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +18%
                  </span>
                </div>
              </div>
            </div>
            <div className="h-44 lg:h-52 mt-5 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 12 }}
                    formatter={(v: any) => [formatINR(v), "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="hsl(38 92% 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pending requests */}
        <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold">Pending Requests</h3>
            <span className="chip bg-warning-soft text-warning">{pending.length} new</span>
          </div>
          {pending.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No pending requests 🎉</div>
          ) : (
            <div className="space-y-2.5">
              {pending.slice(0, 3).map((b) => (
                <Link key={b.id} to={`/bookings/${b.id}`} className="block p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors tap-target">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{b.customerName}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.hallName} • {b.slot === "morning" ? "Day" : "Night"}</div>
                      <div className="text-xs text-primary font-semibold mt-1">{format(parseISO(b.date), "d MMM")} • {formatINR(b.amount)}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
          <h3 className="font-display font-bold">Recent Bookings</h3>
          <Link to="/bookings" className="text-xs text-primary font-semibold flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border/50">
          {bookings.slice(0, 5).map((b) => (
            <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                b.status === "confirmed" ? "bg-success-soft text-success" :
                b.status === "pending" ? "bg-warning-soft text-warning" :
                "bg-muted text-muted-foreground"
              }`}>
                {b.customerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{b.customerName}</div>
                <div className="text-xs text-muted-foreground truncate">{b.hallName} • {format(parseISO(b.date), "d MMM")} • {b.slot === "morning" ? "Day" : "Night"}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display font-bold text-sm">{formatINR(b.amount)}</div>
                <div className={`text-[10px] uppercase font-bold tracking-wide ${
                  b.status === "confirmed" ? "text-success" :
                  b.status === "pending" ? "text-warning" :
                  "text-muted-foreground"
                }`}>{b.status}</div>
              </div>
              <div className="hidden sm:flex gap-1 ml-2">
                <a href={`tel:${b.customerPhone}`} onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center tap-target">
                  <Phone className="h-3.5 w-3.5" />
                </a>
                <a href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}`} target="_blank" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-success-soft text-success flex items-center justify-center tap-target">
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
