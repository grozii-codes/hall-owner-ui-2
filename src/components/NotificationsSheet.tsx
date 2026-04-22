import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar, CheckCircle2, IndianRupee, Star } from "lucide-react";

const items = [
  { icon: Calendar, color: "text-warning bg-warning-soft", title: "New booking request", desc: "Faizan Khan • Kareem Hall • Night slot", time: "2m ago" },
  { icon: IndianRupee, color: "text-success bg-success-soft", title: "Advance payment received", desc: "₹15,000 from Rahul Sharma", time: "1h ago" },
  { icon: Star, color: "text-accent bg-accent-soft", title: "New 5★ review", desc: "Kavita Singh: \"Loved the decoration!\"", time: "3h ago" },
  { icon: CheckCircle2, color: "text-info bg-info-soft", title: "Booking confirmed by you", desc: "Anjali Deshmukh • Royal Garden", time: "Yesterday" },
];

export default function NotificationsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="font-display text-lg">Notifications</SheetTitle>
        </SheetHeader>
        <div className="divide-y">
          {items.map((n, i) => (
            <div key={i} className="px-5 py-4 flex items-start gap-3 hover:bg-muted/40 transition-colors">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                <n.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
