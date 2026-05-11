import { Phone, Siren } from "lucide-react";
import { HOSPITAL } from "@/lib/api";

export default function EmergencyBanner() {
  return (
    <section
      data-testid="emergency-banner"
      className="bg-emergency text-emergency-foreground"
    >
      <div className="container-narrow py-4 sm:py-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-between">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-white/15 grid place-items-center animate-pulse-emergency">
            <Siren className="h-5 w-5" />
          </span>
          <div>
            <div className="font-heading font-bold text-base sm:text-lg leading-tight">
              Medical Emergency? Call us immediately.
            </div>
            <div className="text-xs sm:text-sm text-white/85">
              24/7 ER · GPS-equipped ambulance · ACLS-ready team
            </div>
          </div>
        </div>
        <a
          href={`tel:${HOSPITAL.phoneRaw}`}
          data-testid="emergency-call-btn"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emergency font-bold shadow-lg active:scale-95 transition-transform"
        >
          <Phone className="h-4 w-4" />
          <span className="font-mono">{HOSPITAL.phone}</span>
        </a>
      </div>
    </section>
  );
}
