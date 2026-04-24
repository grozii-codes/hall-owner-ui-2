import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Lock, KeyRound, Phone, Calendar as CalIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [hallId, setHallId] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");

  const handleHallId = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 8);
    setHallId(digits);
  };

  const handlePin = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = d;
    setPin(next);
    if (d && i < 3) {
      const el = document.getElementById(`pin-${i + 1}`);
      el?.focus();
    }
  };

  const submitLogin = () => {
    if (hallId.length !== 8) return toast.error("Enter your 8-digit Hall ID");
    if (pin.join("").length !== 4) return toast.error("Enter your 4-digit PIN");
    toast.success("Welcome back, Kareem Owner");
    localStorage.setItem("bmh_owner_session", "1");
    navigate("/");
  };

  const submitForgot = () => {
    if (!dob) return toast.error("Date of birth required");
    if (mobile.replace(/\D/g, "").length < 10) return toast.error("Enter a valid mobile number");
    toast.success("Reset link sent on your mobile via SMS");
    setView("login");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Top brand */}
      <div className="px-6 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center shadow-lg">
            <Building2 className="h-6 w-6 text-accent-foreground" />
          </div>
          <span className="font-serif-display text-2xl font-bold text-primary-foreground">BookMyHall</span>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70 font-semibold">Owner Console</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-background rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl">
        <div className="max-w-sm mx-auto">
          {view === "login" ? (
            <>
              <h1 className="font-serif-display text-3xl font-bold mb-1">Welcome back</h1>
              <p className="text-sm text-muted-foreground mb-7">
                Sign in with the Hall ID and PIN provided by BookMyHall admin.
              </p>

              <div className="space-y-5">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                    Hall ID (8 digits)
                  </Label>
                  <div className="relative mt-1.5">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      inputMode="numeric"
                      value={hallId}
                      onChange={(e) => handleHallId(e.target.value)}
                      placeholder="e.g. 10024578"
                      className="h-13 pl-10 rounded-xl text-base font-mono tracking-widest"
                      maxLength={8}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                    4-Digit PIN
                  </Label>
                  <div className="flex gap-2.5 mt-1.5">
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
                        className="h-14 w-full text-center text-2xl font-bold rounded-xl border-2 border-border bg-card focus:border-primary focus:outline-none"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={submitLogin}
                  className="w-full h-13 rounded-xl text-base font-semibold bg-primary hover:bg-primary-glow shadow-glow"
                >
                  <Lock className="h-4 w-4 mr-2" /> Sign In
                </Button>

                <button
                  onClick={() => setView("forgot")}
                  className="w-full text-center text-sm font-semibold text-primary hover:underline"
                >
                  Forgot PIN?
                </button>
              </div>

              <div className="mt-10 rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">New here?</span> Contact your BookMyHall admin to receive your Hall ID and PIN. We onboard halls personally to keep your account safe.
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setView("login")} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </button>
              <h1 className="font-serif-display text-3xl font-bold mb-1">Reset PIN</h1>
              <p className="text-sm text-muted-foreground mb-7">
                Verify your identity with your registered date of birth and mobile number.
              </p>

              <div className="space-y-5">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                    Date of Birth
                  </Label>
                  <div className="relative mt-1.5">
                    <CalIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-13 pl-10 rounded-xl text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                    Registered Mobile Number
                  </Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      inputMode="numeric"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 xxxxx xxxxx"
                      className="h-13 pl-10 rounded-xl text-base"
                    />
                  </div>
                </div>

                <Button onClick={submitForgot} className="w-full h-13 rounded-xl text-base font-semibold bg-primary hover:bg-primary-glow">
                  Send Reset SMS
                </Button>
              </div>
            </>
          )}

          <p className="mt-10 text-center text-[11px] text-muted-foreground">
            Service provided by <span className="font-semibold text-foreground">BookMyHall</span>
          </p>
        </div>
      </div>
    </div>
  );
}
