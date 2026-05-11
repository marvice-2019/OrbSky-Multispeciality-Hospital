import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, Calendar, IndianRupee, MapPin, Phone, Stethoscope, ChevronLeft } from "lucide-react";
import { api, HOSPITAL } from "@/lib/api";
import { resolvePhotoUrl } from "@/lib/helpers";
import { Button } from "@/components/ui/button";

const PLACEHOLDER = "https://images.unsplash.com/photo-1631558554226-fb65b25aa939?crop=entropy&cs=srgb&fm=jpg&q=85&w=800";

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then((r) => setDoc(r.data))
      .catch((e) => {
        console.error("Failed to load doctor", e);
        setErr("Doctor not found");
      });
  }, [id]);

  if (err) return <div className="container-narrow py-20 text-center text-foreground/60">{err}</div>;
  if (!doc) return <div className="container-narrow py-20 text-center text-foreground/60">Loading…</div>;

  const imgSrc = resolvePhotoUrl(doc.photo_url, PLACEHOLDER);

  return (
    <div data-testid="doctor-profile-page" className="bg-primary/5 min-h-[60vh]">
      <div className="container-narrow py-10">
        <Link to="/doctors" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to all doctors
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="card-soft p-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img src={imgSrc} alt={doc.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-5 text-xs uppercase tracking-wider font-semibold text-primary">{doc.department}</div>
            <div className="mt-1 font-heading font-bold text-2xl">{doc.name}</div>
            <div className="text-sm text-foreground/65">{doc.designation}</div>
            <div className="mt-5 grid gap-3 text-sm">
              <Row icon={Award} label="Experience" value={`${doc.experience_years} years`} />
              <Row icon={Stethoscope} label="Qualifications" value={doc.qualifications} />
              <Row icon={Calendar} label="Consultation Hours" value={doc.timings} />
              <Row icon={IndianRupee} label="Consultation Fee" value={`₹${doc.consultation_fee}`} />
            </div>
          </div>

          <div className="lg:col-span-2 card-soft p-8">
            <h2 className="font-heading font-bold text-2xl">About {doc.name.split(' ').slice(0,2).join(' ')}</h2>
            <p className="mt-4 text-foreground/75 leading-relaxed">{doc.bio}</p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Button asChild size="lg" data-testid="profile-book-btn">
                <Link to={`/appointments?doctor=${doc.id}&dept=${encodeURIComponent(doc.department)}`}>
                  Book Appointment
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/30 text-primary">
                <a href={`tel:${HOSPITAL.phoneRaw}`}>
                  <Phone className="h-4 w-4 mr-2" /> <span className="font-mono">{HOSPITAL.phone}</span>
                </a>
              </Button>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-secondary/5 border border-secondary/20">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/75">
                  Consultations at OrbSky Multispeciality Hospital, {HOSPITAL.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
      <div>
        <div className="text-[11px] uppercase tracking-wider text-foreground/55">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}
