import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const HOSPITAL = {
  name: "OrbSky Multispeciality Hospital",
  phone: "080 6958 9900",
  phoneRaw: "08069589900",
  whatsapp: "918069589900",
  email: "info@orbskyhospital.com",
  address: "14, 13th Main, Puttenahalli Rd, JP Nagar 7th Phase, Bengaluru 560078",
  hours: "Open 24 Hours",
  rating: 4.5,
  reviewCount: 366,
  mapsEmbed:
    "https://www.google.com/maps?q=14,+13th+Main,+Puttenahalli+Rd,+JP+Nagar+7th+Phase,+Bengaluru,+560078&output=embed",
  mapsLink:
    "https://www.google.com/maps/dir/?api=1&destination=14,+13th+Main,+Puttenahalli+Rd,+JP+Nagar+7th+Phase,+Bengaluru,+560078",
};
