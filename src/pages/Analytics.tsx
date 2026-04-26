import { monthlyRevenue, bookings, formatINR, halls, reviews } from "@/data/mock";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--warning))"];

export default function Analytics() {
  const slotData = [
    { name: "Day", value: bookings.filter((b) => b.slot === "morning").length },
    { name: "Night", value: bookings.filter((b) => b.slot === "night").length },
  ];
  const sourceData = [
    { name: "Online", value: bookings.filter((b) => b.source === "online").length },
    { name: "Offline", value: bookings.filter((b) => b.source === "offline").length },
  ];

  const totalRev = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const avgPerMonth = Math.round(totalRev / monthlyRevenue.length);
  const bestMonth = [...monthlyRevenue].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h2 className="font-serif-display text-2xl lg:text-3xl">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Last 6 months performance overview</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <KpiBox label="Total Revenue" value={formatINR(totalRev)} />
        <KpiBox label="Avg / month" value={formatINR(avgPerMonth)} />
        <KpiBox label="Best month" value={`${bestMonth.month} · ${formatINR(bestMonth.revenue)}`} />
      </div>

      <div className="rounded-md bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-serif-display font-bold text-base">Revenue trend</h3>
          <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Last 6 months</span>
        </div>
        <div className="h-64 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenue} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatINR(v)} width={48} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, color: "hsl(var(--foreground))", fontSize: 12 }} formatter={(v: any) => [formatINR(v), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <ChartCard title="Bookings by slot" data={slotData} />
        <ChartCard title="Bookings by source" data={sourceData} />
      </div>

      <div className="rounded-md bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-serif-display font-bold text-base">Recent reviews</h3>
        </div>
        <div className="divide-y divide-border">
          {reviews.map((r) => {
            const hall = halls.find((h) => h.id === r.hallId);
            return (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm">{r.customerName}</div>
                    <div className="text-xs text-muted-foreground">{hall?.name}</div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-accent text-accent" : "text-muted")} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{r.comment}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-[var(--shadow-card)]">
      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground truncate">{label}</div>
      <div className="font-serif-display font-bold text-base lg:text-lg mt-0.5 truncate tabular-nums">{value}</div>
    </div>
  );
}

function ChartCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <div className="rounded-md bg-card border border-border shadow-[var(--shadow-card)]">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-serif-display font-bold text-base">{title}</h3>
      </div>
      <div className="h-52 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
            <Legend verticalAlign="bottom" iconType="square" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
