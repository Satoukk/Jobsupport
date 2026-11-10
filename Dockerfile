# syntax=docker/dockerfile:1
FROM node:24-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm ci --strict-ssl=true
COPY frontend/ ./
RUN npm run build

# Mount the toolchain instead of copying it through every build layer.
FROM golang:1.26.2-alpine AS go-toolchain
FROM alpine:3.23 AS backend
RUN --mount=from=go-toolchain,source=/usr/local/go,target=/usr/local/go \
    --mount=type=bind,source=backend,target=/src/backend \
    --mount=type=secret,id=proxy_ca \
    --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    set -eu; \
    cp /etc/ssl/certs/ca-certificates.crt /tmp/original-ca.crt; \
    if [ -f /run/secrets/proxy_ca ]; then cat /run/secrets/proxy_ca >> /etc/ssl/certs/ca-certificates.crt; fi; \
    apk add --no-cache gcc musl-dev; \
    cd /src/backend; \
    PATH=/usr/local/go/bin:$PATH GOPATH=/go CGO_ENABLED=1 go build -ldflags='-s -w' -o /server ./cmd/server; \
    mv /tmp/original-ca.crt /etc/ssl/certs/ca-certificates.crt

FROM alpine:3.23
RUN addgroup -S app && adduser -S -G app -u 10001 app && mkdir /data && chown app:app /data
COPY --from=backend /server /app/server
COPY --from=frontend /src/frontend/dist /app/web
ENV GIN_MODE=release STATIC_DIR=/app/web SQLITE_PATH=/data/jobsupport.db PORT=8080
WORKDIR /app
USER app
EXPOSE 8080
CMD ["/app/server"]
