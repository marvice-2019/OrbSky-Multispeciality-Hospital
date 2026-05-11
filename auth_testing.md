# OrbSky Auth Testing Playbook

## Admin credentials
- email: `admin@orbskyhospital.com`
- password: `OrbSky@2026`

## Mongo verification
```
mongosh
use orbsky_hospital
db.users.findOne({role: "admin"})
```
Expect: bcrypt hash starts with `$2b$`, indexes on `users.email` (unique), `login_attempts.identifier`, `password_reset_tokens.expires_at` (TTL).

## API verification
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d'=' -f2)
curl -c /tmp/c.txt -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@orbskyhospital.com","password":"OrbSky@2026"}'
curl -b /tmp/c.txt "$API/api/auth/me"
```
Expect: login returns user object + sets `access_token` & `refresh_token` cookies. `/me` returns same user.
