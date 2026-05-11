import { Award, Building2, HeartHandshake, ShieldCheck, Stethoscope, Users } from "lucide-react";

const EXTERIOR = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800";
const DOC_PATIENT = "https://images.pexels.com/photos/18870282/pexels-photo-18870282.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

const STATS = [
  { value: "120+", label: "Beds & ICU" },
  { value: "40+", label: "Doctors" },
  { value: "20+", label: "Departments" },
  { value: "24/7", label: "Since 2021" },
];

const DIRECTORS = [
  {
    name: "Dr. Sagar Shankar",
    role: "Director · Senior Cardiologist",
    bio: "An interventional cardiologist with 18+ years of clinical and leadership experience. Founding director of OrbSky Hospital.",
  },
  {
    name: "Dr. Nakshatra Janappa",
    role: "Director · Senior OBG Consultant",
    bio: "OBG specialist focused on high-risk pregnancies, fertility and laparoscopic gynaecology. Co-founder of OrbSky.",
  },
];

const INFRA = [
  { icon: Stethoscope, title: "Modular Operation Theatres", text: "HEPA-filtered OTs for general, ortho, OBG and onco surgeries." },
  { icon: ShieldCheck, title: "Multidisciplinary ICU", text: "Cardiac, neuro and medical ICU with 24x7 intensivist coverage." },
  { icon: Award, title: "Diagnostic Lab & Imaging", text: "Pathology, biochemistry, microbiology + MRI, CT, X-Ray." },
  { icon: HeartHandshake, title: "24/7 Pharmacy", text: "Always-open in-house pharmacy with home delivery in JP Nagar." },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(10,106,191,0.92), rgba(0,180,166,0.75)), url(${EXTERIOR})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />
        <div className="relative container-narrow py-16 md:py-24 text-white">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-white/85">About OrbSky</div>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight max-w-3xl">
            Trusted multispeciality care, built in JP Nagar.
          </h1>
          <p className="mt-4 max-w-2xl text-white/85">
            Founded in 2021, OrbSky has grown from a community hospital into a 20+ speciality medical centre serving thousands of families across South Bengaluru.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="-mt-10 relative">
        <div className="container-narrow">
          <div className="card-soft p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center" data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="font-heading font-bold text-3xl text-primary">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-foreground/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section-pad">
        <div className="container-narrow grid lg:grid-cols-2 gap-12 items-center">
          <img src={DOC_PATIENT} alt="OrbSky doctor with senior patient" className="rounded-3xl w-full object-cover aspect-[4/5] shadow-soft" />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Our Story</div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold tracking-tight">
              From neighbourhood clinic to multispeciality hospital.
            </h2>
            <p className="mt-5 text-foreground/75 leading-relaxed">
              We started in 2021 with a single mission — make high-quality multispeciality healthcare accessible
              and affordable for JP Nagar. Five years on, we run 20+ departments, a 24/7 ER, multi-disciplinary
              ICU, in-house diagnostics and a pharmacy that never sleeps.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="card-soft p-5">
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center mb-3"><Users className="h-5 w-5 text-primary" /></div>
                <div className="font-heading font-semibold">Vision</div>
                <p className="text-sm text-foreground/65 mt-1.5">Be Bengaluru&apos;s most trusted neighbourhood multispeciality hospital.</p>
              </div>
              <div className="card-soft p-5">
                <div className="h-11 w-11 rounded-xl bg-secondary/10 grid place-items-center mb-3"><HeartHandshake className="h-5 w-5 text-secondary" /></div>
                <div className="font-heading font-semibold">Mission</div>
                <p className="text-sm text-foreground/65 mt-1.5">Deliver compassionate, accessible and clinically excellent care, 24x7.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECTORS */}
      <section className="section-pad bg-primary/5">
        <div className="container-narrow">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Leadership</div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold tracking-tight">Meet our directors.</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {DIRECTORS.map((d) => (
              <div key={d.name} className="card-soft p-7 flex gap-5" data-testid={`director-${d.name.split(' ')[1].toLowerCase()}`}>
                <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-heading font-bold text-2xl">
                  {d.name.split(" ")[1][0]}
                </div>
                <div>
                  <div className="font-heading font-bold text-lg">{d.name}</div>
                  <div className="text-sm text-primary">{d.role}</div>
                  <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{d.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section className="section-pad">
        <div className="container-narrow">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Infrastructure</div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold tracking-tight">Built for modern healthcare.</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INFRA.map((i) => (
              <div key={i.title} className="card-soft p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center mb-3"><i.icon className="h-5 w-5 text-primary" /></div>
                <div className="font-heading font-semibold">{i.title}</div>
                <p className="text-sm text-foreground/65 mt-1.5 leading-relaxed">{i.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
