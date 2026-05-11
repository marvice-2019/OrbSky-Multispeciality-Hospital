import { MessageCircle } from "lucide-react";
import { HOSPITAL } from "@/lib/api";

export default function WhatsAppButton() {
  const text = encodeURIComponent(
    "Hello OrbSky Hospital, I'd like to book an appointment / get more information."
  );
  return (
    <a
      href={`https://wa.me/${HOSPITAL.whatsapp}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-float-btn"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white font-semibold shadow-2xl hover:scale-105 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline text-sm">WhatsApp Us</span>
    </a>
  );
}
