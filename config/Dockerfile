FROM caddy:builder AS builder

RUN xcaddy build \
    --with github.com/caddyserver/cache-handler \
    --with github.com/darkweak/storages/simplefs/caddy

FROM caddy:alpine

# Copiar o binário que o xcaddy gerou (ele gera no diretório atual por padrão)
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Garantir que os diretórios existam e pertençam ao usuário caddy
# Na imagem caddy:alpine o usuário 'caddy' já existe, mas vamos garantir as permissões
RUN mkdir -p /var/cache/caddy/media /var/log/caddy && \
    chown -R caddy:caddy /var/cache/caddy /var/log/caddy

USER caddy

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
