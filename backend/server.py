from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import requests
from fastapi import (
    APIRouter,
    FastAPI,
    HTTPException,
    Request,
    Response,
    Depends,
    UploadFile,
    File,
    Query,
)
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware


# ----------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"].lower()
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = os.environ.get("APP_NAME", "orbsky-hospital")

JWT_ALG = "HS256"
ACCESS_TTL_MIN = 60 * 24  # 1 day for admin convenience
REFRESH_TTL_DAYS = 7

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("orbsky")

app = FastAPI(title="OrbSky Hospital API")
api_router = APIRouter(prefix="/api")


# ----------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    role: str


class SpecialityModel(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    icon: str
    featured: bool = False


class DoctorModel(BaseModel):
    id: str
    name: str
    designation: str
    department: str
    experience_years: int
    qualifications: str
    bio: str
    consultation_fee: int
    timings: str
    photo_url: Optional[str] = None
    storage_path: Optional[str] = None


class DoctorCreate(BaseModel):
    name: str
    designation: str
    department: str
    experience_years: int = 0
    qualifications: str = ""
    bio: str = ""
    consultation_fee: int = 500
    timings: str = "Mon-Sat, 10:00 AM - 1:00 PM"
    photo_url: Optional[str] = None


class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    experience_years: Optional[int] = None
    qualifications: Optional[str] = None
    bio: Optional[str] = None
    consultation_fee: Optional[int] = None
    timings: Optional[str] = None
    photo_url: Optional[str] = None


class ReviewModel(BaseModel):
    id: str
    reviewer_name: str
    rating: int
    comment: str
    date: str


class AppointmentCreate(BaseModel):
    department: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    appointment_date: str  # ISO date
    appointment_time: str  # e.g. "10:30 AM"
    patient_name: str
    patient_age: int
    patient_phone: str
    patient_email: Optional[str] = None
    reason: str = ""


class AppointmentModel(AppointmentCreate):
    id: str
    status: str = "pending"
    created_at: str


class ContactCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    message: str


class ContactModel(ContactCreate):
    id: str
    created_at: str
    status: str = "new"


# ----------------------------------------------------------------------
# Auth helpers
# ----------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str, email: str, token_type: str = "access") -> str:
    exp = datetime.now(timezone.utc) + (
        timedelta(minutes=ACCESS_TTL_MIN) if token_type == "access" else timedelta(days=REFRESH_TTL_DAYS)
    )
    payload = {"sub": user_id, "email": email, "type": token_type, "exp": exp}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie(
        "access_token", access, httponly=True, secure=True, samesite="none",
        max_age=ACCESS_TTL_MIN * 60, path="/",
    )
    response.set_cookie(
        "refresh_token", refresh, httponly=True, secure=True, samesite="none",
        max_age=REFRESH_TTL_DAYS * 24 * 3600, path="/",
    )


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# ----------------------------------------------------------------------
# Storage helpers
# ----------------------------------------------------------------------
storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY missing; object storage disabled")
        return None
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        r.raise_for_status()
        storage_key = r.json()["storage_key"]
        logger.info("Object storage initialized")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if r.status_code == 403:
        # refresh and retry once
        globals()["storage_key"] = None
        key = init_storage()
        r = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    r.raise_for_status()
    return r.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if r.status_code == 403:
        globals()["storage_key"] = None
        key = init_storage()
        r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")


# ----------------------------------------------------------------------
# Seed data
# ----------------------------------------------------------------------
SPECIALITIES_SEED = [
    ("Cardiology", "heart-pulse", "Comprehensive heart care: diagnosis, intervention and rehab.", True),
    ("Oncology", "ribbon", "Multidisciplinary cancer treatment and chemotherapy support.", True),
    ("Orthopaedics", "bone", "Joint replacement, sports injury and spine specialists.", True),
    ("Maternity", "baby", "Antenatal, delivery and postnatal care under one roof.", True),
    ("Paediatrics", "smile", "Child health, immunization and adolescent care.", True),
    ("Neurology", "brain", "Stroke, epilepsy and neurodegenerative disorder management.", True),
    ("Dental", "tooth", "Cosmetic, orthodontic and surgical dentistry.", False),
    ("Dermatology", "sparkles", "Skin, hair and aesthetic procedures.", False),
    ("Emergency Care", "siren", "24x7 ER, trauma response and critical stabilization.", True),
    ("Gastroenterology", "stethoscope", "Liver, GI tract and endoscopy services.", True),
    ("General Surgery", "scissors", "Laparoscopic and open surgical procedures.", False),
    ("General Check-ups", "clipboard-check", "Preventive health packages for every age.", False),
    ("Diagnostic Imaging", "scan", "MRI, CT scan and ultrasound with rapid reporting.", False),
    ("Laboratory", "test-tube", "NABL-aligned lab tests and pathology.", False),
    ("X-Ray & Radiology", "x", "Digital radiography and interventional radiology.", False),
    ("Outpatient", "users", "Multi-speciality OPD across departments.", False),
    ("Pharmacy", "pill", "In-house 24x7 pharmacy with home delivery.", False),
    ("Physical Therapy", "activity", "Rehab, sports physio and post-op recovery.", False),
    ("Nursing", "heart-handshake", "Skilled bedside nursing and patient support.", False),
    ("Ambulance", "ambulance", "GPS-equipped, ACLS-ready ambulances on call.", False),
]


def _slug(name: str) -> str:
    return name.lower().replace(" ", "-").replace("&", "and").replace("/", "-")


DOCTORS_SEED = [
    ("Dr. Sagar Shankar", "Senior Consultant, Director", "Cardiology", 18, "MBBS, MD, DM (Cardiology)",
     "Director and senior interventional cardiologist with 18+ years across complex angioplasty and structural heart procedures.", 800, "Mon-Sat 10:00 AM - 2:00 PM"),
    ("Dr. Nakshatra Janappa", "Senior Consultant, Director", "Maternity", 16, "MBBS, MS (OBG)",
     "Director and OBG specialist focused on high-risk pregnancies, laparoscopic gynaecology and fertility care.", 700, "Mon-Sat 11:00 AM - 4:00 PM"),
    ("Dr. Anand Rao", "Consultant", "Orthopaedics", 14, "MBBS, MS (Ortho), Fellow Joint Replacement",
     "Knee and hip replacement specialist; sports injury management.", 600, "Mon-Fri 4:00 PM - 7:00 PM"),
    ("Dr. Priya Menon", "Consultant", "Paediatrics", 11, "MBBS, MD (Paediatrics)",
     "Newborn care, vaccination and adolescent medicine.", 500, "Mon-Sat 9:00 AM - 1:00 PM"),
    ("Dr. Vivek Kulkarni", "Senior Consultant", "Neurology", 17, "MBBS, MD, DM (Neurology)",
     "Stroke, epilepsy and movement-disorder specialist.", 750, "Tue-Sat 3:00 PM - 6:00 PM"),
    ("Dr. Anjali Bhatt", "Consultant", "Dermatology", 9, "MBBS, MD (Dermatology)",
     "Medical and cosmetic dermatology; laser procedures.", 600, "Mon-Sat 5:00 PM - 8:00 PM"),
    ("Dr. Karthik Iyer", "Senior Consultant", "Oncology", 15, "MBBS, MD, DM (Medical Oncology)",
     "Solid tumour and haemato-oncology specialist.", 900, "Mon-Wed-Fri 10:00 AM - 1:00 PM"),
    ("Dr. Sneha Reddy", "Consultant", "Gastroenterology", 12, "MBBS, MD, DM (Gastro)",
     "Endoscopy and liver disease specialist.", 700, "Mon-Sat 11:00 AM - 2:00 PM"),
    ("Dr. Rohan Desai", "Consultant", "General Surgery", 13, "MBBS, MS (General Surgery)",
     "Laparoscopic GI and hernia surgery.", 600, "Mon-Sat 12:00 PM - 3:00 PM"),
    ("Dr. Meera Nair", "Consultant", "Dental", 8, "BDS, MDS (Prosthodontics)",
     "Cosmetic dentistry, implants and full-mouth rehab.", 400, "Mon-Sat 10:00 AM - 7:00 PM"),
    ("Dr. Arjun Pillai", "Emergency Physician", "Emergency Care", 10, "MBBS, MEM",
     "Lead ER physician, ACLS instructor.", 500, "24x7 rotation"),
    ("Dr. Lakshmi Suresh", "Consultant", "Maternity", 12, "MBBS, DGO, DNB (OBG)",
     "Painless delivery, antenatal counselling and fetal medicine.", 650, "Mon-Sat 10:00 AM - 1:00 PM"),
]

REVIEWS_SEED = [
    ("Ramesh K.", 5, "Excellent care during my father's bypass. Cardiology team was incredibly attentive and the ICU staff truly compassionate.", "2025-11-14"),
    ("Divya S.", 5, "Delivered my baby here — the maternity ward is clean, modern and Dr. Nakshatra is wonderful. Highly recommend.", "2025-10-22"),
    ("Mahesh P.", 4, "Quick emergency response at 2 AM. Ambulance arrived within 12 minutes. Saved my mother during her stroke.", "2025-09-30"),
    ("Anitha R.", 5, "Got a knee replacement under Dr. Anand. Walking pain-free for the first time in years. Hospital staff is super supportive.", "2025-08-18"),
    ("Suresh M.", 4, "Affordable and professional. Diagnostic lab reports came in within hours. Will return for family check-ups.", "2025-07-05"),
]


async def seed_admin() -> None:
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "OrbSky Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        logger.info("Admin password updated")


async def seed_specialities() -> None:
    if await db.specialities.count_documents({}) > 0:
        return
    docs = []
    for name, icon, desc, featured in SPECIALITIES_SEED:
        docs.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "slug": _slug(name),
            "description": desc,
            "icon": icon,
            "featured": featured,
        })
    await db.specialities.insert_many(docs)
    logger.info(f"Seeded {len(docs)} specialities")


async def seed_doctors() -> None:
    if await db.doctors.count_documents({}) > 0:
        return
    docs = []
    for (name, desig, dept, yrs, qual, bio, fee, timings) in DOCTORS_SEED:
        docs.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "designation": desig,
            "department": dept,
            "experience_years": yrs,
            "qualifications": qual,
            "bio": bio,
            "consultation_fee": fee,
            "timings": timings,
            "photo_url": None,
            "storage_path": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    await db.doctors.insert_many(docs)
    logger.info(f"Seeded {len(docs)} doctors")


async def seed_reviews() -> None:
    if await db.reviews.count_documents({}) > 0:
        return
    docs = [
        {"id": str(uuid.uuid4()), "reviewer_name": n, "rating": r, "comment": c, "date": d}
        for (n, r, c, d) in REVIEWS_SEED
    ]
    await db.reviews.insert_many(docs)
    logger.info(f"Seeded {len(docs)} reviews")


# ----------------------------------------------------------------------
# Startup
# ----------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.doctors.create_index("department")
    await db.appointments.create_index("created_at")
    await seed_admin()
    await seed_specialities()
    await seed_doctors()
    await seed_reviews()
    init_storage()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ----------------------------------------------------------------------
# Routes — Auth
# ----------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(body: LoginRequest, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_token(user["id"], email, "access")
    refresh = create_token(user["id"], email, "refresh")
    set_auth_cookies(response, access, refresh)
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "access_token": access,
    }


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


# ----------------------------------------------------------------------
# Routes — Public content
# ----------------------------------------------------------------------
@api_router.get("/specialities", response_model=List[SpecialityModel])
async def list_specialities():
    items = await db.specialities.find({}, {"_id": 0}).to_list(100)
    return items


@api_router.get("/doctors", response_model=List[DoctorModel])
async def list_doctors(department: Optional[str] = Query(None)):
    q = {"department": department} if department else {}
    items = await db.doctors.find(q, {"_id": 0}).to_list(200)
    return items


@api_router.get("/doctors/{doctor_id}", response_model=DoctorModel)
async def get_doctor(doctor_id: str):
    doc = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doc


@api_router.get("/reviews", response_model=List[ReviewModel])
async def list_reviews():
    items = await db.reviews.find({}, {"_id": 0}).to_list(50)
    return items


@api_router.post("/appointments", response_model=AppointmentModel)
async def create_appointment(body: AppointmentCreate):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.appointments.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.post("/contact", response_model=ContactModel)
async def create_contact(body: ContactCreate):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ----------------------------------------------------------------------
# Routes — Admin
# ----------------------------------------------------------------------
@api_router.get("/admin/appointments")
async def admin_list_appointments(_=Depends(require_admin)):
    items = await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.get("/admin/contacts")
async def admin_list_contacts(_=Depends(require_admin)):
    items = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/admin/doctors", response_model=DoctorModel)
async def admin_create_doctor(body: DoctorCreate, _=Depends(require_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["storage_path"] = None
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.doctors.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/doctors/{doctor_id}", response_model=DoctorModel)
async def admin_update_doctor(doctor_id: str, body: DoctorUpdate, _=Depends(require_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.doctors.update_one({"id": doctor_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doc = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/doctors/{doctor_id}")
async def admin_delete_doctor(doctor_id: str, _=Depends(require_admin)):
    doc = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    await db.doctors.delete_one({"id": doctor_id})
    return {"ok": True}


@api_router.post("/admin/doctors/{doctor_id}/photo")
async def admin_upload_doctor_photo(
    doctor_id: str,
    file: UploadFile = File(...),
    _=Depends(require_admin),
):
    doc = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    ext = (file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg").lower()
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    content_type = file.content_type or f"image/{'jpeg' if ext == 'jpg' else ext}"
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")
    path = f"{APP_NAME}/doctors/{doctor_id}/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, content_type)
    storage_path = result["path"]
    photo_url = f"/api/files/{storage_path}"
    await db.doctors.update_one(
        {"id": doctor_id},
        {"$set": {"storage_path": storage_path, "photo_url": photo_url}},
    )
    return {"photo_url": photo_url, "storage_path": storage_path}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    try:
        data, content_type = get_object(path)
    except requests.HTTPError:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=data, media_type=content_type)


# ----------------------------------------------------------------------
# Mount + CORS
# ----------------------------------------------------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@api_router.get("/")
async def root():
    return {"service": "OrbSky Hospital API", "status": "ok"}
