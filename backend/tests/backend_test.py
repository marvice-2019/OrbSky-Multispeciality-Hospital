"""OrbSky Hospital - Backend API tests.

Covers: public content endpoints, appointments + contact, auth (cookie-based),
admin RBAC, doctor CRUD + photo upload (object storage), file proxy.
"""
import io
import os
import struct
import zlib
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://specialist-hub-15.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@orbskyhospital.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "OrbSky@2026")


# ----- fixtures -----
@pytest.fixture(scope="session")
def anon():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["role"] == "admin"
    assert "access_token" in data
    # Ensure cookie set
    assert "access_token" in s.cookies.get_dict(), f"No access_token cookie: {s.cookies.get_dict()}"
    return s


def _png_bytes(width=2, height=2):
    """Minimal valid PNG generated in memory (no Pillow dep)."""
    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw = b"".join(b"\x00" + b"\xff\x00\x00" * width for _ in range(height))
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


# ----- Public content -----
class TestPublicContent:
    def test_specialities_count_20(self, anon):
        r = anon.get(f"{API}/specialities", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) == 20, f"Expected 20, got {len(items)}"
        # spot check fields
        s = items[0]
        for k in ("id", "name", "slug", "description", "icon", "featured"):
            assert k in s
        names = {i["name"] for i in items}
        assert "Cardiology" in names and "Ambulance" in names

    def test_doctors_count_12(self, anon):
        r = anon.get(f"{API}/doctors", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 12
        d = items[0]
        for k in ("id", "name", "designation", "department", "consultation_fee", "timings"):
            assert k in d

    def test_doctors_filter_cardiology(self, anon):
        r = anon.get(f"{API}/doctors", params={"department": "Cardiology"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        assert all(d["department"] == "Cardiology" for d in items)

    def test_doctor_by_id(self, anon):
        r = anon.get(f"{API}/doctors", timeout=15)
        did = r.json()[0]["id"]
        r2 = anon.get(f"{API}/doctors/{did}", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["id"] == did

    def test_doctor_not_found(self, anon):
        r = anon.get(f"{API}/doctors/does-not-exist", timeout=15)
        assert r.status_code == 404

    def test_reviews_count_5(self, anon):
        r = anon.get(f"{API}/reviews", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 5
        assert all(1 <= i["rating"] <= 5 for i in items)


# ----- Submissions -----
class TestSubmissions:
    def test_create_appointment(self, anon):
        payload = {
            "department": "Cardiology",
            "doctor_name": "Dr. Sagar Shankar",
            "appointment_date": "2026-02-15",
            "appointment_time": "10:30 AM",
            "patient_name": "TEST_Patient",
            "patient_age": 35,
            "patient_phone": "9999999999",
            "patient_email": "test@example.com",
            "reason": "Routine check"
        }
        r = anon.post(f"{API}/appointments", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"]
        assert data["status"] == "pending"
        assert data["patient_name"] == "TEST_Patient"
        assert data["department"] == "Cardiology"

    def test_create_contact(self, anon):
        payload = {
            "name": "TEST_Contact",
            "phone": "9888777666",
            "email": "test_contact@example.com",
            "department": "General",
            "message": "Hello, I would like info."
        }
        r = anon.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"] and data["status"] == "new"
        assert data["name"] == "TEST_Contact"


# ----- Auth -----
class TestAuth:
    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_login_success_sets_cookies(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["role"] == "admin"
        assert body["email"] == ADMIN_EMAIL
        cookies = s.cookies.get_dict()
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    def test_me_with_cookie(self, admin_session):
        r = admin_session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        u = r.json()
        assert u["role"] == "admin"
        assert u["email"] == ADMIN_EMAIL

    def test_me_without_cookie(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_logout_clears_cookies(self):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert "access_token" in s.cookies.get_dict()
        r = s.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200
        # Server sends delete-cookie; requests should drop the cookie
        assert "access_token" not in s.cookies.get_dict() or s.cookies.get("access_token") in (None, "")


# ----- Admin RBAC -----
class TestAdminRBAC:
    def test_admin_appointments_unauth(self):
        r = requests.get(f"{API}/admin/appointments", timeout=15)
        assert r.status_code == 401

    def test_admin_appointments_auth(self, admin_session):
        r = admin_session.get(f"{API}/admin/appointments", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_contacts_unauth(self):
        r = requests.get(f"{API}/admin/contacts", timeout=15)
        assert r.status_code == 401

    def test_admin_contacts_auth(self, admin_session):
        r = admin_session.get(f"{API}/admin/contacts", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ----- Admin Doctor CRUD -----
@pytest.fixture(scope="class")
def created_doctor_id(admin_session):
    payload = {
        "name": "TEST_Doctor",
        "designation": "Consultant",
        "department": "Dermatology",
        "experience_years": 5,
        "qualifications": "MBBS",
        "bio": "test bio",
        "consultation_fee": 400,
        "timings": "Mon-Fri 10-1"
    }
    r = admin_session.post(f"{API}/admin/doctors", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    doc_id = data["id"]
    yield doc_id
    # cleanup
    admin_session.delete(f"{API}/admin/doctors/{doc_id}", timeout=15)


class TestAdminDoctorCRUD:
    def test_create_and_get(self, admin_session, created_doctor_id, anon):
        r = anon.get(f"{API}/doctors/{created_doctor_id}", timeout=15)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Doctor"

    def test_update_and_get(self, admin_session, created_doctor_id, anon):
        r = admin_session.put(
            f"{API}/admin/doctors/{created_doctor_id}",
            json={"consultation_fee": 777, "bio": "TEST_updated"},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json()["consultation_fee"] == 777
        r2 = anon.get(f"{API}/doctors/{created_doctor_id}", timeout=15)
        assert r2.json()["consultation_fee"] == 777
        assert r2.json()["bio"] == "TEST_updated"

    def test_photo_upload_and_serve(self, admin_session, created_doctor_id):
        png = _png_bytes()
        files = {"file": ("avatar.png", io.BytesIO(png), "image/png")}
        # Build a clean session without JSON header
        s = requests.Session()
        s.cookies.update(admin_session.cookies)
        r = s.post(f"{API}/admin/doctors/{created_doctor_id}/photo", files=files, timeout=60)
        if r.status_code == 503:
            pytest.skip("Object storage unavailable in this env")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["photo_url"].startswith("/api/files/")
        # fetch
        rel = body["photo_url"]
        r2 = requests.get(f"{BASE_URL}{rel}", timeout=30)
        assert r2.status_code == 200, f"file proxy failed: {r2.status_code}"
        assert r2.content[:8] == b"\x89PNG\r\n\x1a\n"

    def test_delete_doctor(self, admin_session):
        # create a fresh one to delete (independent of class fixture)
        r = admin_session.post(
            f"{API}/admin/doctors",
            json={"name": "TEST_DelDoc", "designation": "C", "department": "Dental"},
            timeout=15,
        )
        did = r.json()["id"]
        r2 = admin_session.delete(f"{API}/admin/doctors/{did}", timeout=15)
        assert r2.status_code == 200
        r3 = requests.get(f"{API}/doctors/{did}", timeout=15)
        assert r3.status_code == 404
