import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { iconFor } from "@/lib/icons";

export default function SpecialitiesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/specialities")
      .then((r) => setItems(r.data || []))
      .catch((err) => console.warn("Failed to load specialities", err));
  }, []);

  return (
    <div data-testid="specialities-page">
      <section className="bg-primary/5 border-b border-border/60">
        <div className="container-narrow py-14 md:py-20">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Specialities</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold tracking-tight max-w-3xl">
            20+ specialities under one trusted roof.
          </h1>
          <p className="mt-4 text-foreground/65 max-w-2xl">
            Senior consultants, modern infrastructure and integrated diagnostics across every department.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((s) => {
              const Ico = iconFor(s.icon);
              return (
                <div key={s.id} className="card-soft p-6 hover:-translate-y-1 transition-transform group" data-testid={`spec-${s.slug}`}>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 grid place-items-center mb-3 group-hover:scale-110 transition-transform">
                    <Ico className="h-6 w-6 text-primary" />
                  </div>
                  <div className="font-heading font-semibold">{s.name}</div>
                  <p className="text-sm text-foreground/65 mt-2 leading-relaxed line-clamp-3">{s.description}</p>
                  <Link to={`/appointments?dept=${encodeURIComponent(s.name)}`}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:gap-2 transition-all"
                    data-testid={`spec-book-${s.slug}`}>
                    Book Consultation <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
