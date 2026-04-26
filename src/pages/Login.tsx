import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Lock, KeyRound, Phone, Calendar as CalIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [hallId, setHallId] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");

  const handleHallId = (v: string) => setHallId(v.replace(/\D/g, "").slice(0, 8));

  const handlePin = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = d;
    setPin(next);
    if (d && i < 3) document.getElementById(`pin-${i + 1}`)?.focus();
  };

  const submitLogin = () => {
    if (hallId.length !== 8) return toast.error("Enter your 8-digit Hall ID");
    if (pin.join("").length !== 4) return toast.error("Enter your 4-digit PIN");
    toast.success("Welcome back");
    localStorage.setItem("bmh_owner_session", "1");
    navigate("/");
  };

  const submitForgot = () => {
    if (!dob) return toast.error("Date of birth required");
    if (mobile.replace(/\D/g, "").length < 10) return toast.error("Enter a valid mobile number");
    toast.success("Reset link sent via SMS");
    setView("login");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-primary text-primary-foreground px-6 py-5 border-b border-primary/30">
        <div className="max-w-sm mx-auto flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
            <Building2 className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <div className="font-serif-display font-bold text-lg leading-none">BookMyHall</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70 font-bold mt-1">Owner Console</div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto bg-card border border-border rounded-md shadow-[var(--shadow-card)] p-6">
          {view === "login" ? (
            <>
              <h1 className="font-serif-display text-2xl font-bold mb-1">Sign in</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Use the Hall ID and PIN issued by your BookMyHall admin.
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Hall ID (8 digits)</Label>
                  <div className="relative mt-1.5">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      inputMode="numeric"
                      value={hallId}
                      onChange={(e) => handleHallId(e.target.value)}
                      placeholder="10024578"
                      className="h-11 pl-9 rounded-md text-base font-mono tracking-[0.2em]"
                      maxLength={8}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">4-digit PIN</Label>
                  <div className="flex gap-2 mt-1.5">
                    {pin.map((v, i) => (
                      <input
                        key={i}
                        id={`pin-${i}`}
                        type="password"
                        inputMode="numeric"
                        value={v}
                        onChange={(e) => handlePin(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !pin[i] && i > 0) {
                            document.getElementById(`pin-${i - 1}`)?.focus();
                          }
                        }}
                        className="h-12 w-full text-center text-xl font-bold rounded-md border border-border bg-card focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={submitLogin} className="w-full h-11 rounded-md text-sm font-semibold bg-primary hover:bg-primary-glow">
                  <Lock className="h-4 w-4 mr-1.5" /> Sign in
                </Button>

                <button
                  onClick={() => setView("forgot")}
                  className="w-full text-center text-sm font-semibold text-primary hover:underline"
                >
                  Forgot PIN?
                </button>
              </div>

              <div className="mt-6 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">New here?</span> Contact your BookMyHall admin to receive your Hall ID and PIN. Each account is verified personally before activation.
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setView("login")} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground mb-3 hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </button>
              <h1 className="font-serif-display text-2xl font-bold mb-1">Reset PIN</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Verify with your registered date of birth and mobile number.
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Date of birth</Label>
                  <div className="relative mt-1.5">
                    <CalIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-11 pl-9 rounded-md text-sm" />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Registered mobile</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 xxxxx xxxxx" className="h-11 pl-9 rounded-md text-sm" />
                  </div>
                </div>

                <Button onClick={submitForgot} className="w-full h-11 rounded-md text-sm font-semibold bg-primary hover:bg-primary-glow">
                  Send reset SMS
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Service provided by <span className="font-semibold text-foreground">BookMyHall</span>
        </p>
      </main>
    </div>
  );
}
