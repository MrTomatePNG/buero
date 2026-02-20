<script>
    import "../app.scss";
    import { page } from "$app/state";
    import { MessageCircle, House, User, Bell } from "lucide-svelte";
    let { children } = $props();
</script>

<main class="main">
    {@render children()}
    <nav class="bottom-nav">
        <a
            href="/chats"
            class="nav-link"
            class:active={page.url.pathname == "/chats"}
        >
            <MessageCircle />
            <span>Chats</span>
        </a>
        <a href="/" class="nav-link" class:active={page.url.pathname == "/"}>
            <House />
            <span>Home</span>
        </a>
        <a
            href="/notif"
            class="nav-link"
            class:active={page.url.pathname == "/notif"}
        >
            <Bell />
            <span>Notficações</span>
        </a>
        <a
            href="/profile"
            class="nav-link"
            class:active={page.url.pathname === "/profile"}
        >
            <User />
            <span>Perfil</span>
        </a>
    </nav>
</main>

<style lang="scss">
    /* Importa variáveis globais de cor - ajuste o caminho se necessário */
    /* @use "../app.scss"; */

    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: var(--surface); /* Usa a cor de superfície do tema */
        padding: 12px 0;
        box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.15);
        border-top: 1px solid rgba(var(--text-muted), 0.2);
        border-radius: 16px 16px 0 0; /* Cantos arredondados no topo */
        backdrop-filter: blur(10px); /* Efeito de vidro fosco */
        z-index: 1000;
    }

    .nav-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        padding: 8px 0;
        text-decoration: none;
        color: var(--text-muted); /* Cor padrão mais suave */
        transition:
            color 0.3s ease,
            transform 0.2s ease;

        svg {
            width: 24px;
            height: 24px;
            margin-bottom: 4px;
        }

        span {
            font-size: 0.8em;
            font-weight: 500;
        }

        &:hover {
            color: var(--accent); /* Cor de destaque no hover */
        }

        /* Estilo para o link ativo (você pode precisar de lógica SvelteKit para isso) */
        &.active {
            color: var(
                --accent
            ); /* Mesmo que hover, ou uma cor mais vibrante */
            font-weight: bold;

            svg {
                transform: scale(1.1);
            }
        }
    }

    /* Ajuste para o main para que o conteúdo não fique escondido sob a nav */
    .main {
        padding-bottom: 80px; /* Espaço para a altura da nav bar + padding */
    }
</style>
