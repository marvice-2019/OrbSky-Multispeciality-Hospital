import { Activity, Ambulance, Baby, Microscope, Pill, Scissors, Stethoscope, TestTube } from "lucide-react";
import EmergencyBanner from "@/components/EmergencyBanner";

const CATEGORIES = [
  {
    title: "Diagnostics",
    icon: Microscope,
    items: [
      ["Pathology Lab", "NABL-aligned tests, fast turnaround on routine & specialised panels."],
      ["X-Ray", "Digital radiography with same-day reporting."],
      ["Radiology / CT / MRI", "Advanced imaging with consultant radiologist sign-off."],
      ["Ultrasound", "2D, colour Doppler and obstetric scans."],
    ],
  },
  {
    title: "Surgical",
    icon: Scissors,
    items: [
      ["General Surgery", "Laparoscopic GI, hernia and appendix procedures."],
      ["Orthopaedics", "Joint replacement, arthroscopy and trauma."],
      ["Neuro Surgery", "Spine and select neurosurgical interventions."],
      ["Onco Surgery", "Solid-tumour oncological resections."],
    ],
  },
  {
    title: "Outpatient (OPD)",
    icon: Stethoscope,
    items: [
      ["20+ Departments", "Single-window OPD across specialities."],
      ["Consultation Hours", "Mon–Sat, morning & evening slots."],
      ["Transparent Fees", "Starting at ₹400; senior consultants ₹800+."],
      ["Walk-in & Booked", "Same-day booking on most departments."],
    ],
  },
  {
    title: "Emergency & Trauma",
    icon: Ambulance,
    items: [
      ["24/7 ER", "ACLS-ready team, triage on arrival."],
      ["Ambulance", "GPS-equipped, ACLS-fitted ambulances."],
      ["ICU", "Multi-disciplinary critical care unit."],
      ["Trauma Stabilization", "Rapid response for accident victims."],
    ],
  },
  {
    title: "Maternity",
    icon: Baby,
    items: [
      ["Antenatal", "Trimester-wise care, scans, and counselling."],
      ["Delivery", "Painless delivery options, NICU-backed."],
      ["Postnatal", "Mother-and-baby recovery program."],
      ["Fertility", "Initial fertility evaluation and referral."],
    ],
  },
  {
    title: "Pharmacy & Allied",
    icon: Pill,
    items: [
      ["In-house Pharmacy", "Open 24/7, all formularies stocked."],
      ["Physical Therapy", "Post-op rehab and sports physio."],
      ["Home Delivery", "Medicines delivered across JP Nagar."],
      ["Insurance Desk", "All major TPAs supported."],
    ],
  },
];

export default function ServicesPage() {
  return (
    <div data-testid="services-page">
      <section className="bg-primary/5 border-b border-border/60">
        <div className="container-narrow py-14 md:py-20">
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Services</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-heading font-bold tracking-tight max-w-3xl">
            Everything you need — diagnostics, treatment, recovery.
          </h1>
          <p className="mt-4 text-foreground/65 max-w-2xl">
            A complete clinical ecosystem under one roof, available around the clock.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow grid lg:grid-cols-2 gap-6">
          {CATEGORIES.map((c) => (
            <div key={c.title} className="card-soft p-7" data-testid={`service-cat-${c.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 grid place-items-center"><c.icon className="h-6 w-6 text-secondary" /></div>
                <h2 className="font-heading font-bold text-xl">{c.title}</h2>
              </div>
              <ul className="mt-5 space-y-3">
                {c.items.map(([name, desc]) => (
                  <li key={name} className="flex gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-sm text-foreground/65 leading-relaxed">{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <EmergencyBanner />
    </div>
  );
}
