import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOSPITAL } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/specialities", label: "Specialities" },
  { to: "/doctors", label: "Doctors" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const linkCls = ({ isActive }) =>
    cn(
      "px-3 py-2 text-sm font-medium transition-colors rounded-lg",
      isActive ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-primary hover:bg-primary/5"
    );

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-border/60"
    >
      <div className="container-narrow flex h-24 items-center justify-between gap-4">
        <Link to="/" className="flex items-center -my-2" data-testid="logo-link">
          <img
            src="/assets/logo.png"
            alt="OrbSky Hospital"
            className="h-20 sm:h-24 lg:h-28 w-auto object-contain"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" data-testid="primary-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls} end={n.to === "/"} data-testid={`nav-${n.label.toLowerCase()}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a
            href={`tel:${HOSPITAL.phoneRaw}`}
            data-testid="header-call-btn"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 hover:border-primary/40 transition-colors"
          >
            <Phone className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">{HOSPITAL.phone}</span>
          </a>
          <Button asChild data-testid="header-book-btn">
            <Link to="/appointments">Book Appointment</Link>
          </Button>
        </div>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          data-testid="mobile-menu-toggle"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-white" data-testid="mobile-nav">
          <div className="container-narrow py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={linkCls}
                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
              >
                {n.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-2 mt-2">
              <a
                href={`tel:${HOSPITAL.phoneRaw}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{HOSPITAL.phone}</span>
              </a>
              <Button asChild>
                <Link to="/appointments" onClick={() => setOpen(false)}>
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
