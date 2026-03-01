FROM caddy:builder-alpine AS builder

RUN xcaddy build \
    --with github.com/caddyserver/cache-handler \
    --with github.com/darkweak/storages/simplefs/caddy

FROM caddy:alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy

RUN set -x ; \
    addgroup -g 1000 -S caddy 2>/dev/null || true ; \
    adduser -u 1000 -D -S -G caddy caddy 2>/dev/null || true ; \
    mkdir -p /var/cache/caddy/media /var/log/caddy ; \
    chown -R caddy:caddy /var/cache/caddy /var/log/caddy /data /config

VOLUME /data
VOLUME /config

USER caddy

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
