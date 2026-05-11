import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Clock } from "lucide-react";
import { HOSPITAL } from "@/lib/api";

export default function Footer() {
  return (
    <footer className="bg-[#0d1729] text-white/85" data-testid="site-footer">
      <div className="container-narrow py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="bg-white rounded-2xl p-3 inline-block mb-4">
            <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="OrbSky Hospital" className="h-12 w-auto object-contain" />
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            JP Nagar&apos;s trusted multispeciality hospital. 20+ departments. 24/7 emergency care.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/specialities" className="hover:text-secondary">Specialities</Link></li>
            <li><Link to="/doctors" className="hover:text-secondary">Find a Doctor</Link></li>
            <li><Link to="/services" className="hover:text-secondary">Services</Link></li>
            <li><Link to="/appointments" className="hover:text-secondary">Book Appointment</Link></li>
            <li><Link to="/about" className="hover:text-secondary">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" /><span className="text-white/80">{HOSPITAL.address}</span></li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-secondary" /><a href={`tel:${HOSPITAL.phoneRaw}`} className="font-mono">{HOSPITAL.phone}</a></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-secondary" /><a href={`mailto:${HOSPITAL.email}`}>{HOSPITAL.email}</a></li>
            <li className="flex gap-3"><Clock className="h-4 w-4 mt-0.5 text-secondary" /><span>Open 24 Hours</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-white mb-4">Emergency</h4>
          <p className="text-sm text-white/70 mb-3">
            For medical emergencies and ambulance service, call us immediately:
          </p>
          <a
            href={`tel:${HOSPITAL.phoneRaw}`}
            data-testid="footer-emergency-call"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emergency text-emergency-foreground font-semibold shadow-lg"
          >
            <Phone className="h-4 w-4" />
            <span className="font-mono">{HOSPITAL.phone}</span>
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-narrow py-5 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-white/55">
          <span>© {new Date().getFullYear()} OrbSky Multispeciality Hospital. All rights reserved.</span>
          <span>Made for JP Nagar, Bengaluru.</span>
        </div>
      </div>
    </footer>
  );
}
