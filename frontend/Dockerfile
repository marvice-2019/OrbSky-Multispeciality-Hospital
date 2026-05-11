# syntax=docker/dockerfile:1.6

# ----- Stage 1: build static assets with Node ---------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Cache deps
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install

# Build
COPY . ./

# REACT_APP_* must be passed at build time (CRA bakes them into the bundle)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

RUN yarn build

# ----- Stage 2: serve with Nginx ----------------------------------------------
FROM nginx:1.27-alpine

# SPA-friendly nginx config: serve /index.html for any unknown route.
RUN rm /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/orbsky.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Long-cache hashed assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public";
    }

    # SPA fallback — all unknown paths go to index.html
    location / {
        try_files $uri /index.html;
    }
}
EOF

COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
