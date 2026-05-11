// Curated, slug-keyed details for every speciality.
// Used by Home + Specialities pages to render richer cards.
// Keep this in sync with the backend `specialities` collection (icon/name/desc).

export const SPECIALITY_DETAILS = {
  cardiology: {
    tagline: "Comprehensive heart care.",
    conditions: ["Coronary artery disease", "Heart attack / MI", "Hypertension", "Arrhythmia", "Heart failure", "Valvular disease"],
    procedures: ["Angiography", "Angioplasty & Stenting", "Pacemaker implant", "Echo & TMT", "Holter monitoring", "Lipid management"],
    highlights: ["24/7 cardiac emergency", "Senior interventional cardiologist", "Door-to-balloon under 90 min"],
  },
  oncology: {
    tagline: "Multidisciplinary cancer care.",
    conditions: ["Breast cancer", "Lung cancer", "Colorectal cancer", "Lymphoma", "Leukemia", "Head & neck cancers"],
    procedures: ["Chemotherapy day-care", "Targeted therapy", "Immunotherapy", "Tumour board reviews", "Palliative care"],
    highlights: ["Solid tumour + haemato-onco", "Personalised treatment plans", "Pain & palliative support"],
  },
  orthopaedics: {
    tagline: "Bone, joint & spine specialists.",
    conditions: ["Knee/Hip arthritis", "Sports injuries", "Spine disorders", "Fractures", "Frozen shoulder", "Ligament tears"],
    procedures: ["Total knee replacement", "Total hip replacement", "Arthroscopy", "Spine surgery", "Fracture fixation", "PRP therapy"],
    highlights: ["Robotic-assisted joint replacement", "Same-day discharge for arthroscopy", "Sports medicine clinic"],
  },
  maternity: {
    tagline: "From pregnancy to postnatal.",
    conditions: ["Routine pregnancy", "High-risk pregnancy", "PCOS / infertility", "Menstrual disorders", "Fibroids"],
    procedures: ["Painless / epidural delivery", "C-section", "Laparoscopic gynae surgery", "Antenatal scans", "NICU support"],
    highlights: ["Birthing suites", "24/7 OBG cover", "Lactation & postnatal counselling"],
  },
  paediatrics: {
    tagline: "Newborn to adolescent care.",
    conditions: ["Newborn care", "Asthma", "Allergies", "Childhood obesity", "Developmental delays", "Routine illnesses"],
    procedures: ["Immunization", "Growth monitoring", "Adolescent counselling", "Paediatric ER", "NICU"],
    highlights: ["Child-friendly OPD", "Vaccination tracker", "Paediatric emergency 24/7"],
  },
  neurology: {
    tagline: "Brain, spine & nervous system.",
    conditions: ["Stroke", "Epilepsy", "Migraine", "Parkinson's", "Multiple sclerosis", "Neuropathy"],
    procedures: ["EEG", "Nerve conduction studies", "Stroke thrombolysis", "Botulinum therapy"],
    highlights: ["Stroke-ready ER", "Movement disorder clinic", "Headache clinic"],
  },
  dental: {
    tagline: "Cosmetic, surgical, kids dentistry.",
    conditions: ["Cavities", "Gum disease", "Missing teeth", "Crooked teeth", "TMJ issues"],
    procedures: ["Implants", "Root canal", "Braces / Aligners", "Whitening", "Full-mouth rehab"],
    highlights: ["Digital smile design", "Painless laser dentistry", "Same-day crowns"],
  },
  dermatology: {
    tagline: "Skin, hair & cosmetic procedures.",
    conditions: ["Acne", "Eczema", "Psoriasis", "Hair loss", "Pigmentation", "Vitiligo"],
    procedures: ["Laser hair removal", "Chemical peels", "PRP for hair", "Skin biopsy", "Tattoo removal"],
    highlights: ["Medical + cosmetic derma", "FDA-cleared lasers", "Trichoscopy"],
  },
  "emergency-care": {
    tagline: "24×7 trauma & critical care.",
    conditions: ["Trauma & accidents", "Cardiac emergencies", "Stroke", "Poisoning", "Sepsis", "Burns"],
    procedures: ["Resuscitation", "Triage & stabilisation", "ICU transfer", "Emergency surgery", "Ambulance dispatch"],
    highlights: ["ACLS / ATLS-ready team", "GPS-tracked ambulance", "Multi-disciplinary ICU"],
  },
  gastroenterology: {
    tagline: "Liver, GI & endoscopy.",
    conditions: ["Acid reflux / GERD", "Ulcers", "Hepatitis", "Fatty liver", "IBS", "Gallstones"],
    procedures: ["Upper GI endoscopy", "Colonoscopy", "ERCP", "Liver function workup"],
    highlights: ["Advanced endoscopy suite", "Liver clinic", "Same-day endoscopy"],
  },
  "general-surgery": {
    tagline: "Open & laparoscopic procedures.",
    conditions: ["Hernias", "Gallstones", "Appendicitis", "Piles / fissures", "Thyroid swelling", "Lumps & cysts"],
    procedures: ["Laparoscopic hernia repair", "Lap cholecystectomy", "Appendectomy", "Day-care procedures"],
    highlights: ["Minimal-access surgery", "Day-care discharge", "Onco-surgery support"],
  },
  "general-check-ups": {
    tagline: "Preventive health packages.",
    conditions: ["Lifestyle disease screening", "Diabetes", "Hypertension", "Thyroid", "Cholesterol"],
    procedures: ["Master health check", "Cardiac risk profile", "Diabetic profile", "Executive health package"],
    highlights: ["Same-day reports", "Senior-citizen plans", "Family packages"],
  },
  "diagnostic-imaging": {
    tagline: "MRI, CT, ultrasound.",
    conditions: ["Stroke imaging", "Pre-surgical planning", "Cancer staging", "Obstetric scans"],
    procedures: ["MRI 1.5T", "Multi-slice CT", "Colour Doppler", "X-Ray", "Mammography"],
    highlights: ["Consultant radiologist sign-off", "Rapid reporting", "Image CD on request"],
  },
  laboratory: {
    tagline: "NABL-aligned pathology.",
    conditions: ["Routine screening", "Disease monitoring", "Pre-op workup"],
    procedures: ["Biochemistry", "Haematology", "Microbiology", "Hormone assays", "Cancer markers"],
    highlights: ["Home sample collection", "Same-day reports for routine", "Online report access"],
  },
  "x-ray-and-radiology": {
    tagline: "Digital X-ray & radiology.",
    conditions: ["Fractures", "Chest infections", "Joint problems", "Spine evaluation"],
    procedures: ["Digital X-Ray", "Fluoroscopy", "IVU", "Barium studies"],
    highlights: ["Low-dose digital X-ray", "Instant images", "Consultant reads"],
  },
  outpatient: {
    tagline: "OPD across 20+ specialities.",
    conditions: ["Routine consultations", "Follow-up visits", "Second opinions"],
    procedures: ["Walk-in OPD", "Booked appointments", "Tele-consult on request"],
    highlights: ["Mon–Sat AM & PM slots", "Transparent fees", "Multi-specialty under one roof"],
  },
  pharmacy: {
    tagline: "In-house 24×7 pharmacy.",
    conditions: ["Acute & chronic medication needs"],
    procedures: ["OPD dispensing", "IPD dispensing", "Home delivery (JP Nagar)"],
    highlights: ["24/7 availability", "All major formularies stocked", "Insurance/TPA tie-ups"],
  },
  "physical-therapy": {
    tagline: "Rehab & sports physio.",
    conditions: ["Post-surgery recovery", "Sports injuries", "Back / neck pain", "Stroke rehab", "Frozen shoulder"],
    procedures: ["Therapeutic ultrasound", "TENS", "Manual therapy", "Sports rehab"],
    highlights: ["Senior physiotherapists", "Home physio on request", "Sports clinic"],
  },
  nursing: {
    tagline: "Skilled bedside care.",
    conditions: ["Inpatient nursing", "Post-op care", "ICU nursing"],
    procedures: ["IV care", "Wound care", "Vitals monitoring", "Discharge teaching"],
    highlights: ["1:4 nurse-to-patient (general)", "1:1 (ICU)", "Trained ICU nurses"],
  },
  ambulance: {
    tagline: "GPS-tracked, ACLS-ready.",
    conditions: ["Cardiac / trauma transfers", "Inter-hospital transfers", "Critical pickup"],
    procedures: ["BLS ambulance", "ACLS ambulance", "Inter-hospital transfer"],
    highlights: ["GPS-tracked", "Trained EMT + nurse", "On-call 24/7"],
  },
};

export function detailsFor(slug) {
  return SPECIALITY_DETAILS[slug] || {
    tagline: "Specialist care.",
    conditions: [],
    procedures: [],
    highlights: [],
  };
}
