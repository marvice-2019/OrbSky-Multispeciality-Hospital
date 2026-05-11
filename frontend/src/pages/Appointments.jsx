import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, CalendarDays, Clock4, Phone, MessageCircle } from "lucide-react";
import { api, HOSPITAL, formatApiErrorDetail } from "@/lib/api";
import { stepState } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const STEP_DOT_CLASSES = {
  done: "bg-secondary text-white",
  current: "bg-primary text-white",
  todo: "bg-white border border-border text-foreground/50",
};

const STEPS = ["Department", "Doctor", "Date & Time", "Your Details"];
const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

export default function AppointmentsPage() {
  const [params, setParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [specs, setSpecs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [data, setData] = useState({
    department: params.get("dept") || "",
    doctor_id: params.get("doctor") || "",
    doctor_name: "",
    appointment_date: null,
    appointment_time: "",
    patient_name: "",
    patient_age: "",
    patient_phone: "",
    patient_email: "",
    reason: "",
  });
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/specialities")
      .then((r) => setSpecs(r.data || []))
      .catch((err) => console.warn("Failed to load specialities", err));
  }, []);

  useEffect(() => {
    if (!data.department) return;
    api.get(`/doctors?department=${encodeURIComponent(data.department)}`)
      .then((r) => setDoctors(r.data || []))
      .catch((err) => console.warn("Failed to load doctors", err));
  }, [data.department]);

  // Hydrate doctor name when arriving with ?doctor=
  useEffect(() => {
    if (data.doctor_id && doctors.length && !data.doctor_name) {
      const d = doctors.find((x) => x.id === data.doctor_id);
      if (d) setData((s) => ({ ...s, doctor_name: d.name }));
    }
  }, [doctors, data.doctor_id, data.doctor_name]);

  // Skip step 0 if dept arrived from URL
  useEffect(() => {
    if (params.get("dept") && step === 0 && data.department) setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canNext = useMemo(() => {
    if (step === 0) return !!data.department;
    if (step === 1) return !!data.doctor_id;
    if (step === 2) return !!data.appointment_date && !!data.appointment_time;
    return true;
  }, [step, data]);

  const submit = async () => {
    if (!data.patient_name || !data.patient_age || !data.patient_phone) {
      toast.error("Please fill in patient name, age and phone.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        department: data.department,
        doctor_id: data.doctor_id,
        doctor_name: data.doctor_name,
        appointment_date: data.appointment_date.toISOString().slice(0, 10),
        appointment_time: data.appointment_time,
        patient_name: data.patient_name,
        patient_age: Number(data.patient_age),
        patient_phone: data.patient_phone,
        patient_email: data.patient_email || undefined,
        reason: data.reason,
      };
      const res = await api.post("/appointments", payload);
      setConfirmed(res.data);
      toast.success("Appointment requested! We'll confirm shortly.");
    } catch (e) {
      toast.error(formatApiErrorDetail(e?.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) return <Confirmation appt={confirmed} />;

  return (
    <div data-testid="appointments-page" className="bg-primary/5 min-h-[70vh]">
      <div className="container-narrow py-12">
        <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Book an Appointment</div>
        <h1 className="mt-2 font-heading font-bold text-3xl sm:text-4xl tracking-tight">A 4-step booking flow.</h1>

        {/* Stepper */}
        <ol className="mt-8 grid grid-cols-4 gap-2" data-testid="appointment-stepper">
          {STEPS.map((label, i) => {
            const state = stepState(i, step);
            const dotCls = STEP_DOT_CLASSES[state];
            const labelCls = state === "current" ? "text-foreground" : "text-foreground/55";
            return (
              <li key={label} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold ${dotCls}`}>
                  {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div className={`text-xs sm:text-sm font-medium hidden sm:block ${labelCls}`}>{label}</div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 card-soft p-6 sm:p-8">
          {step === 0 && (
            <div data-testid="step-department">
              <h2 className="font-heading font-semibold text-xl">Which department do you need?</h2>
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {specs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setData({ ...data, department: s.name, doctor_id: "", doctor_name: "" })}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      data.department === s.name ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                    }`}
                    data-testid={`dept-option-${s.slug}`}
                  >
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-xs text-foreground/60 mt-1 line-clamp-2">{s.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div data-testid="step-doctor">
              <h2 className="font-heading font-semibold text-xl">Pick a specialist from {data.department}</h2>
              {doctors.length === 0 ? (
                <div className="mt-6 text-sm text-foreground/60">
                  No doctors listed yet. You can still proceed — our team will assign the on-duty specialist.
                  <Button className="ml-3" size="sm" onClick={() => setData({ ...data, doctor_id: "general", doctor_name: "On-duty specialist" })}>
                    Continue
                  </Button>
                </div>
              ) : (
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {doctors.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setData({ ...data, doctor_id: d.id, doctor_name: d.name })}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        data.doctor_id === d.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                      }`}
                      data-testid={`doctor-option-${d.id}`}
                    >
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-xs text-foreground/60 mt-0.5">{d.designation} · <span className="font-mono">{d.experience_years} yrs</span></div>
                      <div className="text-xs text-foreground/55 mt-1">{d.timings}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div data-testid="step-datetime" className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="font-heading font-semibold text-xl flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Pick a date</h2>
                <div className="mt-4">
                  <Calendar
                    mode="single"
                    selected={data.appointment_date}
                    onSelect={(d) => setData({ ...data, appointment_date: d })}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-xl border border-border/60 bg-white"
                  />
                </div>
              </div>
              <div>
                <h2 className="font-heading font-semibold text-xl flex items-center gap-2"><Clock4 className="h-5 w-5 text-primary" /> Pick a time</h2>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setData({ ...data, appointment_time: t })}
                      className={`p-2.5 rounded-lg text-sm font-mono border-2 transition-all ${
                        data.appointment_time === t ? "border-primary bg-primary/5 text-primary" : "border-border/60 hover:border-primary/40"
                      }`}
                      data-testid={`time-${t.replace(/[^0-9]/g, '')}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="step-details">
              <h2 className="font-heading font-semibold text-xl">Patient details</h2>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <Input placeholder="Patient name *" value={data.patient_name} onChange={(e) => setData({ ...data, patient_name: e.target.value })} data-testid="appt-name" />
                <Input placeholder="Age *" type="number" value={data.patient_age} onChange={(e) => setData({ ...data, patient_age: e.target.value })} data-testid="appt-age" />
                <Input placeholder="Phone *" value={data.patient_phone} onChange={(e) => setData({ ...data, patient_phone: e.target.value })} data-testid="appt-phone" />
                <Input placeholder="Email" type="email" value={data.patient_email} onChange={(e) => setData({ ...data, patient_email: e.target.value })} data-testid="appt-email" />
              </div>
              <Textarea placeholder="Reason for visit (symptoms, history, etc.)" value={data.reason} onChange={(e) => setData({ ...data, reason: e.target.value })} className="mt-4 min-h-28" data-testid="appt-reason" />

              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm">
                <div className="font-semibold mb-2">Summary</div>
                <div className="text-foreground/75">
                  <span className="font-medium">{data.department}</span> · {data.doctor_name} ·{" "}
                  <span className="font-mono">{data.appointment_date?.toDateString()}</span> · <span className="font-mono">{data.appointment_time}</span>
                </div>
              </div>
            </div>
          )}

          {/* nav */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="border-primary/30">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < 3 ? (
              <Button disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="appt-next-btn">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} data-testid="appt-submit-btn" className="bg-primary">
                {submitting ? "Submitting…" : "Confirm Appointment"}
              </Button>
            )}
          </div>
        </div>

        {/* Alt CTAs */}
        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <a href={`tel:${HOSPITAL.phoneRaw}`} className="card-soft p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wider text-foreground/55">Prefer to call?</div>
              <div className="font-mono font-semibold">{HOSPITAL.phone}</div>
            </div>
          </a>
          <a
            href={`https://wa.me/${HOSPITAL.whatsapp}?text=${encodeURIComponent("I'd like to book an appointment at OrbSky Hospital.")}`}
            target="_blank" rel="noreferrer"
            className="card-soft p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
          >
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            <div>
              <div className="text-xs uppercase tracking-wider text-foreground/55">Or chat on WhatsApp</div>
              <div className="font-semibold">Send a message</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function Confirmation({ appt }) {
  const waText = encodeURIComponent(
    `Hello OrbSky, I've requested an appointment.\nName: ${appt.patient_name}\nDept: ${appt.department}\nDoctor: ${appt.doctor_name}\nDate: ${appt.appointment_date} ${appt.appointment_time}\nID: ${appt.id}`
  );
  return (
    <div className="container-narrow py-16" data-testid="appointment-confirmation">
      <div className="max-w-2xl mx-auto card-soft p-8 sm:p-10 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-secondary/15 grid place-items-center">
          <Check className="h-8 w-8 text-secondary" />
        </div>
        <h1 className="mt-5 font-heading font-bold text-3xl">Appointment requested!</h1>
        <p className="mt-2 text-foreground/70">
          Our team will confirm via call within 30 minutes. Reference ID:{" "}
          <span className="font-mono font-semibold">{appt.id.slice(0, 8).toUpperCase()}</span>
        </p>

        <div className="mt-7 grid sm:grid-cols-2 gap-3 text-left">
          <Field label="Patient" value={appt.patient_name} />
          <Field label="Department" value={appt.department} />
          <Field label="Doctor" value={appt.doctor_name} />
          <Field label="Date & Time" value={`${appt.appointment_date} · ${appt.appointment_time}`} mono />
          <Field label="Phone" value={appt.patient_phone} mono />
          <Field label="Status" value={appt.status} />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-[#25D366] hover:bg-[#1ebd5d]" data-testid="confirm-whatsapp-btn">
            <a href={`https://wa.me/${HOSPITAL.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" /> Confirm via WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" className="border-primary/30 text-primary">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="p-3 rounded-lg bg-primary/5">
      <div className="text-[11px] uppercase tracking-wider text-foreground/55">{label}</div>
      <div className={mono ? "font-mono font-medium mt-0.5" : "font-medium mt-0.5"}>{value}</div>
    </div>
  );
}
