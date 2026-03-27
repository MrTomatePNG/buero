vcl 4.1;

import std;

backend default {
    .host = "minio";
    .port = "9000";
}

sub vcl_recv {
    # Somente cache para GET e HEAD
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    # Se a requisição for para o console do MinIO ou buckets privados (se houver), não cachear
    # Mas aqui vamos assumir que tudo em media.buero.fun é público
    return (hash);
}

sub vcl_backend_response {
    # Cachear por 1 hora se a origem não especificar nada
    if (beresp.ttl <= 0s) {
        set beresp.ttl = 1h;
        set beresp.grace = 1h;
    }

    # Garantir que headers de cache sejam respeitados ou forçados
    set beresp.http.X-CDN-Cache = "HIT-FROM-LOCAL-VARNISH";
}

sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
        set resp.http.X-Cache-Hits = obj.hits;
    } else {
        set resp.http.X-Cache = "MISS";
    }
}
