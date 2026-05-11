# OrbSky Hospital — Self-Host Deployment Guide (Hostinger VPS / any Linux box)

A copy-paste deployment for any Ubuntu/Debian VPS using Docker Compose + Nginx + Let's Encrypt.

---

## What you get

- **MongoDB** (Dockerised, persistent volume, not exposed to public internet)
- **FastAPI backend** on `127.0.0.1:8001` (Dockerised)
- **React build served by Nginx** on `127.0.0.1:8080` (Dockerised)
- **Host-level Nginx** terminates SSL and reverse-proxies `/api/*` to the backend and everything else to the frontend
- **Let's Encrypt SSL** via Certbot
- One-command updates after the first deploy

---

## 0. Prereqs on the VPS

- Ubuntu 22.04 LTS or Debian 12 (Hostinger's default VPS images work)
- A domain pointed at the VPS public IP (`A` records for both `orbskyhospital.com` and `www.orbskyhospital.com`)
- Open inbound ports **80** and **443** in the firewall

```bash
# Install Docker + compose plugin + nginx + certbot
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release nginx
curl -fsSL https://get.docker.com | sudo sh
sudo apt-get install -y docker-compose-plugin
sudo apt-get install -y certbot python3-certbot-nginx

# Allow your user to run docker (log out / log back in after this)
sudo usermod -aG docker $USER
```

---

## 1. Get the code on the VPS

```bash
cd /opt
sudo git clone https://github.com/<your-org>/orbsky-hospital.git
sudo chown -R $USER:$USER /opt/orbsky-hospital
cd /opt/orbsky-hospital
```

---

## 2. Configure secrets

```bash
cp .env.example .env
nano .env
```

Fill in:

| Var | What |
| --- | --- |
| `MONGO_INITDB_ROOT_USERNAME` / `MONGO_INITDB_ROOT_PASSWORD` | strong creds, used only inside Docker |
| `MONGO_URL` | `mongodb://<user>:<pass>@mongo:27017/orbsky_hospital?authSource=admin` (must match the user/pass above) |
| `MONGO_DB_NAME` | `orbsky_hospital` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin login for `/admin/login` |
| `CORS_ORIGINS` | `https://orbskyhospital.com,https://www.orbskyhospital.com` |
| `REACT_APP_BACKEND_URL` | `https://orbskyhospital.com` (your public domain — this is baked into the JS bundle at build time) |
| `EMERGENT_LLM_KEY` | optional; only needed for doctor-photo uploads. Leave blank to disable that feature |

---

## 3. Build & start the stack

```bash
docker compose build
docker compose up -d
docker compose logs -f backend   # confirm "Admin seeded" + "Object storage initialized"
# Ctrl-C to detach
```

Containers should now be running on `127.0.0.1:8001` (backend) and `127.0.0.1:8080` (frontend). They're **not** publicly reachable yet — Nginx on the host is what exposes them.

---

## 4. Host-level Nginx reverse proxy

```bash
sudo cp deploy/nginx/orbskyhospital.com.conf /etc/nginx/sites-available/orbskyhospital.com
sudo ln -s /etc/nginx/sites-available/orbskyhospital.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default        # if it exists
sudo nginx -t && sudo systemctl reload nginx
```

Visit `http://orbskyhospital.com` — you should see the React app load and `/api/specialities` work.

---

## 5. Add SSL (free, auto-renewing)

```bash
sudo certbot --nginx -d orbskyhospital.com -d www.orbskyhospital.com
```

Choose the redirect option (HTTP -> HTTPS). Certbot edits the Nginx config in place and sets up a systemd timer to auto-renew. Done.

---

## 6. Verify

| Check | How |
| ----- | --- |
| Homepage loads | open `https://orbskyhospital.com` |
| API up | `curl https://orbskyhospital.com/api/specialities` -> 20-item JSON |
| Admin login | go to `/admin/login`, use the seeded creds |
| JSON-LD | paste your URL into <https://search.google.com/test/rich-results> — should detect `Hospital` + `Organization` |
| Booking flow | submit a test appointment, see it in admin dashboard |

---

## 7. Updating after a code change

```bash
cd /opt/orbsky-hospital
git pull
docker compose build
docker compose up -d
```

Zero downtime is not guaranteed but typical recovery is under 5 seconds. For a true zero-downtime rolling update, switch to a Docker Swarm or k8s setup later — overkill for a single-VPS hospital site.

---

## 8. Backups (Mongo)

```bash
# Daily dump to /opt/orbsky-hospital/backups/
mkdir -p /opt/orbsky-hospital/backups
docker exec orbsky_mongo sh -c \
  'exec mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive' \
  > /opt/orbsky-hospital/backups/orbsky_$(date +%F).archive
```

Wire this into a cron job (`crontab -e`):

```
0 2 * * * /usr/bin/docker exec orbsky_mongo sh -c 'exec mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive' > /opt/orbsky-hospital/backups/orbsky_$(date +\%F).archive 2>>/var/log/orbsky-backup.log
```

Off-site copy is your responsibility (rclone to S3 / B2 / Google Drive).

---

## 9. Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `502 Bad Gateway` from `/api/*` | `docker compose logs backend` — usually a Mongo connection issue. Check `MONGO_URL` matches the user/pass in `MONGO_INITDB_ROOT_*` |
| Login works in curl but cookies don't stick in browser | Ensure the site is served over **HTTPS** — cookies are `SameSite=None; Secure`, browsers reject them on plain HTTP. |
| Doctor photo upload returns `503 Storage unavailable` | `EMERGENT_LLM_KEY` is missing or invalid. Either set it or disable the upload feature in the admin UI |
| CORS errors in console | Make sure `CORS_ORIGINS` exactly matches your public scheme + host with no trailing slash |
| Site loads but API calls hit the old preview URL | You forgot to rebuild after changing `REACT_APP_BACKEND_URL` — `docker compose build frontend` then `docker compose up -d frontend` |

---

## File layout reference

```
/opt/orbsky-hospital/
├── .env                              # your secrets (gitignored)
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── server.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
└── deploy/
    └── nginx/
        └── orbskyhospital.com.conf
```
