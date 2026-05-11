import { useEffect, useState } from "react";
import { Clock, Mail, MapPin, Phone, Send, Ambulance } from "lucide-react";
import { api, HOSPITAL, formatApiErrorDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", department: "", message: "" });
  const [specs, setSpecs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/specialities")
      .then((r) => setSpecs(r.data || []))
      .catch((err) => console.warn("Failed to load specialities", err));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error("Please fill in your name, phone and message.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/contact", { ...form, email: form.email || undefined, department: form.department || undefined });
      toast.success("Message sent. Our team will reach out soon.");
      setForm({ name: "", phone: "", email: "", department: "", message: "" });
    } catch (e) {
      toast.error(formatApiErrorDetail(e?.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <section className="bg-primary/5 border-b border-border/60">
        <div className="container-narrow py-14 md:py-20">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Contact</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold tracking-tight max-w-3xl">
            We&apos;re here, around the clock.
          </h1>
          <p className="mt-4 text-foreground/65 max-w-2xl">
            Call, message, or drop by — our team responds within minutes.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow grid lg:grid-cols-5 gap-8">
          <aside className="lg:col-span-2 space-y-5">
            <InfoCard icon={MapPin} title="Visit" value={HOSPITAL.address} href={HOSPITAL.mapsLink} hrefLabel="Get Directions" />
            <InfoCard icon={Phone} title="Call" value={HOSPITAL.phone} href={`tel:${HOSPITAL.phoneRaw}`} hrefLabel="Tap to Call" mono />
            <InfoCard icon={Mail} title="Email" value={HOSPITAL.email} href={`mailto:${HOSPITAL.email}`} hrefLabel="Send Email" />
            <InfoCard icon={Clock} title="Hours" value="Open 24 Hours, 7 Days" />

            <a
              href={`tel:${HOSPITAL.phoneRaw}`}
              data-testid="contact-ambulance-btn"
              className="block p-6 rounded-2xl bg-emergency text-emergency-foreground shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3">
                <Ambulance className="h-7 w-7" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/80">Ambulance Service</div>
                  <div className="font-heading font-bold text-lg">Call Now</div>
                </div>
              </div>
              <div className="mt-4 font-mono text-2xl font-bold">{HOSPITAL.phone}</div>
            </a>
          </aside>

          <form onSubmit={submit} className="lg:col-span-3 card-soft p-7" data-testid="contact-form">
            <h2 className="font-heading font-bold text-2xl">Send us a message</h2>
            <p className="text-sm text-foreground/65 mt-1">We typically reply within 30 minutes.</p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Input placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" required />
              <Input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="contact-phone" required />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" />
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger data-testid="contact-department"><SelectValue placeholder="Department (optional)" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {specs.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="How can we help? *"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-4 min-h-32"
              data-testid="contact-message"
              required
            />
            <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto" disabled={submitting} data-testid="contact-submit">
              {submitting ? "Sending…" : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </div>

        <div className="container-narrow mt-12 card-soft overflow-hidden h-[420px]">
          <iframe title="OrbSky Hospital Map" src={HOSPITAL.mapsEmbed} className="w-full h-full border-0" loading="lazy" />
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, href, hrefLabel, mono }) {
  return (
    <div className="card-soft p-6" data-testid={`contact-info-${title.toLowerCase()}`}>
      <div className="flex gap-4">
        <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center shrink-0"><Icon className="h-5 w-5 text-primary" /></div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-foreground/55">{title}</div>
          <div className={mono ? "mt-1 font-mono font-semibold" : "mt-1 font-semibold"}>{value}</div>
          {href && (
            <a href={href} target={title === "Visit" ? "_blank" : undefined} rel="noreferrer"
               className="inline-block mt-2 text-sm font-semibold text-primary hover:underline">
              {hrefLabel} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
