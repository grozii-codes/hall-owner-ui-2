import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { halls as initialHalls, DEFAULT_POLICIES, HALL_TYPES, type Hall } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Camera, Plus, Save, Trash2, Building2, ImagePlus, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

const FOOD_TYPES = ["Veg Only", "Non-Veg Only", "Veg & Non-Veg", "Jain"];
const CATEGORIES = ["Wedding", "Reception", "Birthday", "Corporate", "Conference", "Engagement"];
const AMENITIES_OPTIONS = ["AC", "Parking", "Catering", "DJ", "Decoration", "Generator", "CCTV", "Wi-Fi", "Bridal Room", "Stage", "Dance Floor", "Lift"];

export default function EditHall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const original = useMemo(() => initialHalls.find((h) => h.id === id), [id]);

  const [hall, setHall] = useState<Hall | undefined>(original);
  const [newPolicy, setNewPolicy] = useState("");
  const [policySelect, setPolicySelect] = useState("");
  const [locating, setLocating] = useState(false);

  const fetchAddress = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const addr = data?.display_name as string | undefined;
          const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state_district;
          if (addr) update("address", addr);
          if (city) update("city", city);
          toast.success("Address fetched from your location");
        } catch {
          toast.error("Couldn't reverse-geocode. Please type manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!hall) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-muted-foreground">Hall not found.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/halls">Back to Halls</Link>
        </Button>
      </div>
    );
  }

  const update = <K extends keyof Hall>(key: K, value: Hall[K]) =>
    setHall((h) => (h ? { ...h, [key]: value } : h));

  const toggleAmenity = (a: string) => {
    update(
      "amenities",
      hall.amenities.includes(a) ? hall.amenities.filter((x) => x !== a) : [...hall.amenities, a]
    );
  };

  const addPolicyFromSelect = () => {
    if (!policySelect) return;
    const list = hall.policies ?? [];
    if (list.includes(policySelect)) {
      toast.error("Policy already added");
      return;
    }
    update("policies", [...list, policySelect]);
    setPolicySelect("");
  };

  const addManualPolicy = () => {
    const v = newPolicy.trim();
    if (!v) return;
    update("policies", [...(hall.policies ?? []), v]);
    setNewPolicy("");
  };

  const removePolicy = (idx: number) => {
    update("policies", (hall.policies ?? []).filter((_, i) => i !== idx));
  };

  const save = () => {
    toast.success("Hall details updated");
    navigate("/halls");
  };

  return (
    <div className="px-4 lg:px-8 py-4 lg:py-6 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-xl lg:text-2xl truncate">Edit Hall</h2>
          <p className="text-xs text-muted-foreground truncate">{hall.name}</p>
        </div>
      </div>

      {/* Photo */}
      <Section title="Cover Photo">
        <div className="relative h-44 rounded-2xl bg-gradient-hero overflow-hidden border border-border/50 flex items-center justify-center">
          {hall.photo ? (
            <img src={hall.photo} alt={hall.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Building2 className="h-20 w-20 text-primary-foreground opacity-30" />
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute bottom-3 right-3 rounded-full h-9 shadow-md"
            onClick={() => toast.info("Photo upload coming soon")}
          >
            <Camera className="h-4 w-4 mr-1.5" /> Change Photo
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full rounded-xl h-10"
          onClick={() => toast.info("Gallery upload coming soon")}
        >
          <ImagePlus className="h-4 w-4 mr-2" /> Add Gallery Photos
        </Button>
      </Section>

      {/* Basic Info */}
      <Section title="Basic Information">
        <Field label="Hall Name">
          <Input value={hall.name} onChange={(e) => update("name", e.target.value)} className="rounded-xl h-11" />
        </Field>
        <Field label="Hall Type">
          <Select value={hall.hallType ?? ""} onValueChange={(v) => update("hallType", v)}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select hall type" /></SelectTrigger>
            <SelectContent>{HALL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Support / Contact Number">
          <Input value={hall.supportNumber ?? ""} onChange={(e) => update("supportNumber", e.target.value)} placeholder="e.g. +91 98765 43210" className="rounded-xl h-11" inputMode="tel" />
        </Field>
        <Field label="Address">
          <div className="space-y-2">
            <Textarea value={hall.address} onChange={(e) => update("address", e.target.value)} className="rounded-xl min-h-[72px]" placeholder="Building, street, area..." />
            <Button type="button" variant="outline" onClick={fetchAddress} disabled={locating} className="w-full h-10 rounded-xl border-dashed">
              {locating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2 text-primary" />}
              {locating ? "Fetching your location..." : "Auto-fetch from current location"}
            </Button>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <Input value={hall.city} onChange={(e) => update("city", e.target.value)} className="rounded-xl h-11" />
          </Field>
          <Field label="Capacity">
            <Input
              type="number"
              value={hall.capacity}
              onChange={(e) => update("capacity", Number(e.target.value) || 0)}
              className="rounded-xl h-11"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={hall.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Food Type">
            <Select value={hall.foodType} onValueChange={(v) => update("foodType", v)}>
              <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
              <SelectContent>{FOOD_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={hall.description} onChange={(e) => update("description", e.target.value)} className="rounded-xl min-h-[80px]" />
        </Field>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Day Slot (₹)">
            <Input type="number" value={hall.morningPrice} onChange={(e) => update("morningPrice", Number(e.target.value) || 0)} className="rounded-xl h-11" />
          </Field>
          <Field label="Night Slot (₹)">
            <Input type="number" value={hall.nightPrice} onChange={(e) => update("nightPrice", Number(e.target.value) || 0)} className="rounded-xl h-11" />
          </Field>
        </div>
      </Section>

      {/* Timings */}
      <Section title="Timings">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-In">
            <Input value={hall.checkInTime ?? ""} onChange={(e) => update("checkInTime", e.target.value)} placeholder="e.g. 9:00 AM" className="rounded-xl h-11" />
          </Field>
          <Field label="Check-Out">
            <Input value={hall.checkOutTime ?? ""} onChange={(e) => update("checkOutTime", e.target.value)} placeholder="e.g. Next day 9:00 AM" className="rounded-xl h-11" />
          </Field>
          <Field label="Day Slot Time">
            <Input value={hall.morningSlotTime ?? ""} onChange={(e) => update("morningSlotTime", e.target.value)} placeholder="e.g. 9 AM – 4 PM" className="rounded-xl h-11" />
          </Field>
          <Field label="Night Slot Time">
            <Input value={hall.nightSlotTime ?? ""} onChange={(e) => update("nightSlotTime", e.target.value)} placeholder="e.g. 7 PM – 5 AM" className="rounded-xl h-11" />
          </Field>
        </div>
      </Section>

      {/* Facilities */}
      <Section title="Facilities & Amenities">
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES_OPTIONS.map((a) => {
            const checked = hall.amenities.includes(a);
            return (
              <label
                key={a}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition ${
                  checked ? "border-primary bg-primary/5" : "border-border/60"
                }`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleAmenity(a)} />
                <span className="text-sm">{a}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Policies */}
      <Section
        title="Hall Policies"
        subtitle="Customers will see these rules before booking. Pick from suggestions or write your own."
      >
        <div className="space-y-2">
          {(hall.policies ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground italic">No policies added yet.</p>
          )}
          {(hall.policies ?? []).map((p, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                {idx + 1}
              </span>
              <p className="text-sm flex-1 leading-snug">{p}</p>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive" onClick={() => removePolicy(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add from suggestions</Label>
          <div className="flex gap-2">
            <Select value={policySelect} onValueChange={setPolicySelect}>
              <SelectTrigger className="rounded-xl h-11 flex-1"><SelectValue placeholder="Choose a standard policy" /></SelectTrigger>
              <SelectContent>
                {DEFAULT_POLICIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="button" onClick={addPolicyFromSelect} className="rounded-xl h-11 px-4">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Write your own policy</Label>
          <div className="flex gap-2">
            <Input
              value={newPolicy}
              onChange={(e) => setNewPolicy(e.target.value)}
              placeholder="e.g. No firecrackers inside premises"
              className="rounded-xl h-11 flex-1"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addManualPolicy())}
            />
            <Button type="button" onClick={addManualPolicy} variant="secondary" className="rounded-xl h-11 px-4">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* Status */}
      <Section title="Hall Status">
        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Accepting Bookings</div>
            <div className="text-xs text-muted-foreground">Toggle off to pause new bookings</div>
          </div>
          <Switch checked={hall.active} onCheckedChange={(v) => update("active", v)} className="data-[state=checked]:bg-success" />
        </div>
      </Section>

      {/* Sticky Save */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-64 bg-background/95 backdrop-blur border-t border-border/60 p-3 z-30">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Button variant="outline" className="rounded-xl h-12 flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button className="rounded-xl h-12 flex-1 bg-primary shadow-glow" onClick={save}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border border-border/50 shadow-card p-4 lg:p-5 mb-4">
      <h3 className="font-display font-bold text-base mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 mb-3 last:mb-0">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
