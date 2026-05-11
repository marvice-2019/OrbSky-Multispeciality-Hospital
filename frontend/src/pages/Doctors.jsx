import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Award, Calendar, ChevronRight, Stethoscope } from "lucide-react";
import { api } from "@/lib/api";
import { resolvePhotoUrl } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLACEHOLDER = "https://images.unsplash.com/photo-1631558554226-fb65b25aa939?crop=entropy&cs=srgb&fm=jpg&q=85&w=800";

export default function DoctorsPage() {
  const [params, setParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [filter, setFilter] = useState(params.get("dept") || "all");

  useEffect(() => {
    api.get("/doctors")
      .then((r) => setDoctors(r.data || []))
      .catch((err) => console.warn("Failed to load doctors", err));
    api.get("/specialities")
      .then((r) => setSpecialities(r.data || []))
      .catch((err) => console.warn("Failed to load specialities", err));
  }, []);

  const onFilterChange = (v) => {
    setFilter(v);
    if (v === "all") {
      params.delete("dept");
    } else {
      params.set("dept", v);
    }
    setParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    if (filter === "all") return doctors;
    return doctors.filter((d) => d.department === filter);
  }, [doctors, filter]);

  return (
    <div data-testid="doctors-page">
      <section className="bg-primary/5 border-b border-border/60">
        <div className="container-narrow py-14 md:py-20">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Find a Doctor</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold tracking-tight max-w-3xl">
            Meet our specialists.
          </h1>
          <p className="mt-4 text-foreground/65 max-w-2xl">
            Senior consultants across every department, with a combined 200+ years of clinical experience.
          </p>
          <div className="mt-8 max-w-xs">
            <Select value={filter} onValueChange={onFilterChange}>
              <SelectTrigger className="bg-white h-11" data-testid="doctor-filter-trigger">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Departments</SelectItem>
                {specialities.map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-foreground/60" data-testid="no-doctors">
              No doctors found in this department.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((d) => (
                <div key={d.id} className="card-soft overflow-hidden hover:-translate-y-1 transition-transform" data-testid={`doctor-card-${d.id}`}>
                  <div className="aspect-[5/4] bg-muted overflow-hidden">
                    <img
                      src={resolvePhotoUrl(d.photo_url, PLACEHOLDER)}
                      alt={d.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs uppercase tracking-wider font-semibold text-primary">{d.department}</div>
                    <div className="mt-1 font-heading font-bold text-lg">{d.name}</div>
                    <div className="text-sm text-foreground/65">{d.designation}</div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-foreground/65">
                      <Award className="h-4 w-4 text-secondary" />
                      <span className="font-mono">{d.experience_years} yrs</span>
                      <span>·</span>
                      <span>{d.qualifications}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-foreground/65">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span>{d.timings}</span>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Button asChild size="sm" className="flex-1" data-testid={`doctor-book-${d.id}`}>
                        <Link to={`/appointments?doctor=${d.id}&dept=${encodeURIComponent(d.department)}`}>Book</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 border-primary/30 text-primary">
                        <Link to={`/doctors/${d.id}`}>
                          Profile <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
