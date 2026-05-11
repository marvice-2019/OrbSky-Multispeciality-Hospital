# OrbSky Multispeciality Hospital — Product Requirements Doc

## Original problem statement
Build a 7-page hospital website (Home, Specialities, Doctors, Services, About, Contact, Appointments) for **OrbSky Multispeciality Hospital**, JP Nagar 7th Phase, Bengaluru. Goal: convert local search traffic into appointment bookings; build trust via credentials, reviews, specialist visibility. Brand: Trust Blue `#0A6ABF`, Health Teal `#00B4A6`, Emergency Red `#E84040`. Phone: `080 6958 9900`. 4.5★ / 366 Google reviews. Open 24 Hours.

## Architecture
- **Frontend**: React 19 + react-router-dom 7 + Tailwind + Shadcn UI + sonner + lucide-react
- **Backend**: FastAPI + Motor (async MongoDB)
- **Auth**: JWT (HS256) in httpOnly `SameSite=None; Secure` cookies; bcrypt password hashing; idempotent admin seed at startup
- **Storage**: Emergent Object Storage for doctor profile photos; served via authenticated `/api/files/{path}` proxy
- **Identity**: UUID string ids in all collections (no ObjectId in responses)

## User personas
1. **Patient / family caregiver (mobile-first)** — searches "hospital JP Nagar", lands on Home, wants to call or book quickly.
2. **Speciality seeker** — already needs Cardiology / Maternity etc., browses Specialities → Doctors → Profile → Book.
3. **Emergency walk-in (desktop or mobile)** — needs immediate ambulance / ER number above the fold.
4. **Hospital admin (staff)** — logs in, views appointment requests, manages doctors and photos.

## Core requirements (static)
- 7 public routes + 2 admin routes (`/admin/login`, `/admin`)
- Hero, trust strip, departments carousel, "Why OrbSky" pillars, specialities grid, Google reviews, emergency banner, map embed, footer
- Multi-step appointment flow (Department → Doctor → Date/Time → Patient Details) with confirmation screen + WhatsApp click-to-confirm
- Click-to-call header CTA + floating WhatsApp button (`+91 80 6958 9900`)
- Admin: doctor CRUD, photo upload, appointments table, contacts table
- Brand color compliance; Plus Jakarta Sans / Inter / Roboto Mono typography

## Implemented (2026-05-11)
- ✅ FastAPI app with auth (`/api/auth/login|me|logout`), public content endpoints, admin endpoints, file proxy
- ✅ MongoDB seeded with 20 specialities, 12 doctors, 5 reviews on startup
- ✅ All 7 public pages + Doctor profile page + 2 admin pages
- ✅ Shadcn-based components (Calendar, Select, Tabs, Toaster, Button, Card, Input, Textarea)
- ✅ Multi-step booking with shadcn Calendar + time-slot grid + on-screen confirmation
- ✅ WhatsApp confirmation link with prefilled appointment details
- ✅ Admin dashboard with stats tiles, three tabs (Appointments / Doctors / Contacts), full doctor CRUD, photo upload via Emergent object storage
- ✅ Official OrbSky orb logo placed in Header, Footer, Admin shell, and favicon
- ✅ SEO: page title, theme-color, meta description
- ✅ Backend tests: 21/21 pass (auth, RBAC, doctor CRUD, photo upload+download round-trip, appointments, contacts)
- ✅ Frontend e2e flows verified by testing subagent

## Deferred / Backlog
- **P1** Real GMB review pull via Google Places API
- **P1** Optional SMS confirmation (Twilio) and email confirmation (Resend) — requires user-supplied keys
- **P1** Schema.org `MedicalOrganization` / `Physician` JSON-LD injection per page
- **P2** Doctor self-service availability calendar (slot booking with conflict detection)
- **P2** Patient portal (view past appointments, prescriptions)
- **P2** Health package marketplace (preventive check-ups)
- **P2** Insurance/TPA partner page

## Next tasks
1. Hook live Google reviews when API key is shared
2. Add SMS/email confirmation when keys are provided
3. Inject JSON-LD `Hospital` schema (provided in brief) into `<head>` of Home, Doctors and Contact pages
