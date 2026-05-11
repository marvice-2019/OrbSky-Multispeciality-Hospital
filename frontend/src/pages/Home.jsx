import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Star, ShieldCheck, Clock, Stethoscope, Ambulance, Microscope, HeartPulse, Wallet, ChevronRight, MapPin } from "lucide-react";
import { api, HOSPITAL } from "@/lib/api";
import { iconFor } from "@/lib/icons";
import EmergencyBanner from "@/components/EmergencyBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HERO_BG = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000";
const ABOUT_IMG = "https://images.pexels.com/photos/14558560/pexels-photo-14558560.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

const PILLARS = [
  { icon: Microscope, title: "Advanced Diagnostics", text: "In-house MRI, CT, digital X-Ray and NABL-aligned lab — rapid reports." },
  { icon: Stethoscope, title: "Specialist Doctors", text: "Senior consultants across 20+ departments with decades of experience." },
  { icon: Wallet, title: "Affordable Care", text: "Transparent pricing, insurance support and EMI options for surgeries." },
  { icon: Clock, title: "24/7 Availability", text: "Round-the-clock ER, ambulance, pharmacy and OPD coverage." },
];

export default function HomePage() {
  const [specialities, setSpecialities] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/specialities")
      .then((r) => setSpecialities(r.data || []))
      .catch((err) => console.warn("Failed to load specialities", err));
    api.get("/reviews")
      .then((r) => setReviews(r.data || []))
      .catch((err) => console.warn("Failed to load reviews", err));
  }, []);

  const featured = specialities.filter((s) => s.featured).slice(0, 6);
  const carousel = specialities.slice(0, 10);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(10,106,191,0.92) 0%, rgba(0,180,166,0.75) 100%), url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container-narrow py-20 md:py-28 lg:py-36 text-white">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-medium uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emergency animate-pulse" /> 24/7 Emergency Care
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-balance">
              Comprehensive Care, Around the Clock —
              <span className="block text-secondary-light">JP Nagar&apos;s Trusted Multispeciality Hospital.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/85 max-w-2xl">
              <span className="font-mono">24/7 Emergency</span> · <span className="font-mono">20+ Specialities</span> · <span className="font-mono">{HOSPITAL.reviewCount}+ Satisfied Patients</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-6 h-12 rounded-xl" data-testid="hero-book-btn">
                <Link to="/appointments">Book an Appointment <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <a href={`tel:${HOSPITAL.phoneRaw}`} data-testid="hero-call-btn"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-xl border-2 border-white/40 hover:bg-white/10 font-semibold transition-colors">
                <Phone className="h-4 w-4" /> Call Now: <span className="font-mono">{HOSPITAL.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — sits between hero and next section, half-overlapping the hero bottom */}
      <section className="container-narrow relative z-10 -mt-12 sm:-mt-16">
        <div className="bg-white border border-border/60 rounded-2xl p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-[0_20px_60px_-15px_rgba(10,106,191,0.25)]">
          <TrustItem icon={Star} label="Google Rating" value={`${HOSPITAL.rating}★`} sub={`${HOSPITAL.reviewCount} reviews`} color="text-amber-500" />
          <TrustItem icon={Clock} label="Open" value="24/7" sub="Round the clock" color="text-primary" />
          <TrustItem icon={ShieldCheck} label="Specialities" value="20+" sub="Multi-discipline" color="text-secondary" />
          <TrustItem icon={Ambulance} label="Ambulance" value="On Call" sub="ACLS-ready" color="text-emergency" />
        </div>
      </section>

      {/* SPECIALITY CAROUSEL */}
      <section className="section-pad pt-16 sm:pt-20">
        <div className="container-narrow">
          <SectionHeader eyebrow="Featured Departments" title="Care across every speciality" subtitle="Quick access to our most-visited departments. Tap any to learn more." />
          <div className="mt-10 flex gap-4 overflow-x-auto scrollbar-thin pb-4 snap-x" data-testid="speciality-carousel">
            {carousel.map((s) => {
              const Ico = iconFor(s.icon);
              return (
                <Link key={s.id} to="/specialities"
                  className="snap-start shrink-0 w-44 sm:w-52 card-soft p-5 hover:-translate-y-1 transition-transform"
                  data-testid={`carousel-${s.slug}`}>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center mb-3"><Ico className="h-6 w-6 text-primary" /></div>
                  <div className="font-heading font-semibold text-sm">{s.name}</div>
                  <div className="text-xs text-foreground/60 mt-1 line-clamp-2">{s.description}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY ORBSKY */}
      <section className="section-pad bg-white">
        <div className="container-narrow grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader eyebrow="Why OrbSky" title="Built on trust, backed by clinical excellence." subtitle="Four pillars that make us JP Nagar's preferred multispeciality hospital." align="left" />
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {PILLARS.map((p) => (
                <div key={p.title} className="card-soft p-5 hover:-translate-y-1 transition-transform" data-testid={`pillar-${p.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="h-11 w-11 rounded-xl bg-secondary/10 grid place-items-center mb-3"><p.icon className="h-5 w-5 text-secondary" /></div>
                  <div className="font-heading font-semibold">{p.title}</div>
                  <p className="text-sm text-foreground/65 mt-1.5 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src={ABOUT_IMG} alt="Doctor with patient at OrbSky" className="rounded-3xl shadow-soft w-full object-cover aspect-[5/6]" />
            <div className="absolute -bottom-6 -left-6 card-soft p-5 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center"><HeartPulse className="h-6 w-6 text-primary" /></div>
                <div>
                  <div className="font-heading font-bold text-2xl">25,000+</div>
                  <div className="text-xs text-foreground/60 uppercase tracking-wider">Patients cared for</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALITIES GRID (FEATURED 6) */}
      <section className="section-pad">
        <div className="container-narrow">
          <SectionHeader eyebrow="Specialities" title="Care that's deeply specialised." subtitle="From routine consultations to complex interventions — explore our most-asked departments." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((s) => {
              const Ico = iconFor(s.icon);
              return (
                <div key={s.id} className="card-soft p-7 hover:-translate-y-1 transition-transform group" data-testid={`speciality-card-${s.slug}`}>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 grid place-items-center mb-4 group-hover:scale-110 transition-transform">
                    <Ico className="h-7 w-7 text-primary" />
                  </div>
                  <div className="font-heading font-semibold text-lg">{s.name}</div>
                  <p className="text-sm text-foreground/65 mt-2 leading-relaxed">{s.description}</p>
                  <Link to="/specialities" className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:gap-2 transition-all">
                    Know More <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
              <Link to="/specialities" data-testid="view-all-specialities">View all 20 specialities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section-pad bg-primary/5">
        <div className="container-narrow">
          <SectionHeader eyebrow={`${HOSPITAL.rating}★ on Google · ${HOSPITAL.reviewCount} reviews`} title="What our patients say." subtitle="Real experiences from families across Bengaluru." />
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((r) => (
              <Card key={r.id} className="p-6 border-border/60 shadow-soft" data-testid={`review-card-${r.id}`}>
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={`star-${r.id}-${i}`} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center font-heading font-bold text-primary">
                    {r.reviewer_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.reviewer_name}</div>
                    <div className="text-xs font-mono text-foreground/55">{r.date}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <EmergencyBanner />

      {/* MAP + LOCATION */}
      <section className="section-pad">
        <div className="container-narrow grid lg:grid-cols-5 gap-8 items-stretch">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <SectionHeader eyebrow="Visit Us" title="Find OrbSky in JP Nagar 7th Phase." subtitle="" align="left" />
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex gap-3"><MapPin className="h-5 w-5 mt-0.5 text-primary shrink-0" /><span>{HOSPITAL.address}</span></div>
              <div className="flex gap-3"><Phone className="h-5 w-5 mt-0.5 text-primary shrink-0" /><a href={`tel:${HOSPITAL.phoneRaw}`} className="font-mono">{HOSPITAL.phone}</a></div>
              <div className="flex gap-3"><Clock className="h-5 w-5 mt-0.5 text-primary shrink-0" /><span>{HOSPITAL.hours}</span></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><a href={HOSPITAL.mapsLink} target="_blank" rel="noreferrer" data-testid="get-directions-btn">Get Directions</a></Button>
              <Button asChild variant="outline" className="border-primary/30 text-primary">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-3 card-soft overflow-hidden h-[420px]">
            <iframe title="OrbSky Hospital Map" src={HOSPITAL.mapsEmbed} className="w-full h-full border-0" loading="lazy"></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle, align = "center" }) {
  return (
    <div className={align === "center" ? "max-w-3xl mx-auto text-center" : "max-w-2xl"}>
      {eyebrow && <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">{eyebrow}</div>}
      <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold tracking-tight text-balance">{title}</h2>
      {subtitle && <p className="mt-3 text-foreground/65">{subtitle}</p>}
    </div>
  );
}

function TrustItem({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="flex items-center gap-3" data-testid={`trust-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`h-10 w-10 rounded-xl bg-muted grid place-items-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-heading font-bold text-lg leading-none">{value}</div>
        <div className="text-[11px] uppercase tracking-wider text-foreground/55 mt-1">{sub}</div>
      </div>
    </div>
  );
}
