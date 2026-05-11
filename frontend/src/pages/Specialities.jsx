import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Stethoscope, CheckCircle2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { iconFor } from "@/lib/icons";
import { detailsFor } from "@/lib/specialityDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SpecialitiesPage() {
  const [items, setItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/specialities")
      .then((r) => setItems(r.data || []))
      .catch((err) => console.warn("Failed to load specialities", err));
    api.get("/doctors")
      .then((r) => setDoctors(r.data || []))
      .catch((err) => console.warn("Failed to load doctors", err));
  }, []);

  const doctorCounts = useMemo(() => {
    return doctors.reduce((acc, d) => {
      acc[d.department] = (acc[d.department] || 0) + 1;
      return acc;
    }, {});
  }, [doctors]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const needle = q.toLowerCase();
    return items.filter((s) => {
      if (s.name.toLowerCase().includes(needle)) return true;
      if (s.description.toLowerCase().includes(needle)) return true;
      const d = detailsFor(s.slug);
      const hay = [...d.conditions, ...d.procedures].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q]);

  return (
    <div data-testid="specialities-page">
      <section className="bg-gradient-to-b from-primary/8 to-transparent border-b border-border/60">
        <div className="container-narrow py-14 md:py-20">
          <div className="grid lg:grid-cols-5 gap-8 items-end">
            <div className="lg:col-span-3">
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Specialities</div>
              <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold tracking-tight">
                <span className="font-mono text-primary">20+</span> specialities under one trusted roof.
              </h1>
              <p className="mt-4 text-foreground/65 max-w-2xl">
                Senior consultants, modern infrastructure and integrated diagnostics across every department —
                from routine OPD to complex interventions.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search a condition, procedure or department…"
                  className="pl-10 h-12 bg-white"
                  data-testid="speciality-search"
                />
              </div>
              <div className="mt-3 text-xs text-foreground/55 font-mono">
                Showing {filtered.length} of {items.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad pt-12">
        <div className="container-narrow">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-foreground/55">
              No specialities match &ldquo;{q}&rdquo;.{" "}
              <button onClick={() => setQ("")} className="text-primary font-semibold hover:underline">Clear search</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((s) => (
                <SpecialityCard key={s.id} s={s} doctorCount={doctorCounts[s.name] || 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA strip */}
      <section className="section-pad bg-primary/5 border-t border-border/60">
        <div className="container-narrow text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">Not sure which speciality?</h2>
          <p className="mt-3 text-foreground/65">Call us — our team will route you to the right department in under 60 seconds.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" data-testid="cta-book"><Link to="/appointments">Book an Appointment</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary/30 text-primary"><Link to="/doctors">Browse Doctors</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SpecialityCard({ s, doctorCount }) {
  const Ico = iconFor(s.icon);
  const d = detailsFor(s.slug);

  return (
    <article className="card-soft p-6 sm:p-7 hover:-translate-y-1 transition-transform" data-testid={`spec-${s.slug}`}>
      <header className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 grid place-items-center">
          <Ico className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-lg">{s.name}</h3>
            {doctorCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">
                {doctorCount} {doctorCount === 1 ? "doctor" : "doctors"}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/65 mt-1 leading-relaxed">{s.description}</p>
        </div>
      </header>

      {d.conditions.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-foreground/55 mb-2">Conditions we treat</div>
          <div className="flex flex-wrap gap-1.5">
            {d.conditions.slice(0, 6).map((c) => (
              <span key={c} className="text-xs px-2.5 py-1 rounded-md bg-primary/5 text-foreground/75 border border-primary/10">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {d.procedures.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-foreground/55 mb-2">Key procedures & services</div>
          <ul className="grid sm:grid-cols-2 gap-x-3 gap-y-1.5">
            {d.procedures.slice(0, 6).map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-foreground/75">
                <CheckCircle2 className="h-3.5 w-3.5 mt-1 text-secondary shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {d.highlights.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-secondary/5 border border-secondary/15 flex gap-2 items-start">
          <Sparkles className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
          <div className="text-xs text-foreground/75 leading-relaxed">
            {d.highlights.join(" · ")}
          </div>
        </div>
      )}

      <footer className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm" data-testid={`spec-book-${s.slug}`}>
          <Link to={`/appointments?dept=${encodeURIComponent(s.name)}`}>Book Consultation</Link>
        </Button>
        {doctorCount > 0 && (
          <Button asChild size="sm" variant="outline" className="border-primary/30 text-primary">
            <Link to={`/doctors?dept=${encodeURIComponent(s.name)}`}>
              Meet doctors <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        )}
      </footer>
    </article>
  );
}
