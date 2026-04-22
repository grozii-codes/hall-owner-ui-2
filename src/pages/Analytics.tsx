import { monthlyRevenue, bookings, formatINR, halls, reviews } from "@/data/mock";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Star } from "lucide-react";

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

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Last 6 months overview</p>
      </div>

      {/* Revenue */}
      <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-5 lg:p-6 shadow-elevated">
        <p className="text-xs uppercase tracking-wider opacity-70 font-semibold">6-Month Revenue</p>
        <h3 className="font-display font-bold text-3xl lg:text-4xl mt-1">{formatINR(totalRev)}</h3>
        <div className="h-56 mt-5 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38 92% 60%)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(38 92% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 12 }} formatter={(v: any) => [formatINR(v), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(38 92% 60%)" fill="url(#g1)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Bookings by Slot" data={slotData} />
        <ChartCard title="Bookings by Source" data={sourceData} />
      </div>

      {/* Reviews */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="font-display font-bold">Recent Reviews</h3>
        </div>
        <div className="divide-y divide-border/50">
          {reviews.map((r) => {
            const hall = halls.find((h) => h.id === r.hallId);
            return (
              <div key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm">{r.customerName}</div>
                    <div className="text-xs text-muted-foreground">{hall?.name}</div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mt-2">{r.comment}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-card">
      <h3 className="font-display font-bold mb-3">{title}</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
