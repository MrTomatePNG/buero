<script>
    import "../app.scss";
    import { page } from "$app/state";
    import { MessageCircle, House, User, Bell } from "lucide-svelte";
    let { children } = $props();
</script>

<div class="app-shell">
    <main class="content">
        {@render children()}
    </main>

    <nav class="bottom-nav">
        <a
            href="/chats"
            class="nav-link"
            class:active={page.url.pathname == "/chats"}
        >
            <MessageCircle size={24} />
            <span>Chats</span>
        </a>
        <a href="/" class="nav-link" class:active={page.url.pathname == "/"}>
            <House size={24} />
            <span>Home</span>
        </a>
        <a
            href="/notif"
            class="nav-link"
            class:active={page.url.pathname == "/notif"}
        >
            <Bell size={24} />
            <span>Notificações</span>
        </a>
        <a
            href="/profile"
            class="nav-link"
            class:active={page.url.pathname === "/profile"}
        >
            <User size={24} />
            <span>Perfil</span>
        </a>
    </nav>
</div>

<style lang="scss">
    .app-shell {
        display: flex;
        flex-direction: column;
        height: 100svh; // Altura fixa da tela
        width: 100%;
        overflow: hidden;
        background-color: var(--bg);
    }

    .content {
        flex: 1; // Ocupa todo o espaço restante
        overflow-y: auto; // Permite rolagem APENAS aqui dentro
        -webkit-overflow-scrolling: touch; // Suaviza rolagem no iOS
        position: relative;
    }

    .bottom-nav {
        height: 64px; // Altura fixa e proporcional
        flex-shrink: 0; // Impede que a nav encolha
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: var(--surface);
        border-top: 1px solid rgba(var(--text-muted), 0.1);
        padding-bottom: env(safe-area-inset-bottom); // Suporte para iPhone (notch inferior)
        box-sizing: content-box; // Garante que o padding do iPhone não altere a altura base
        z-index: 10;
    }

    .nav-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        height: 100%;
        text-decoration: none;
        color: var(--text-muted);
        transition: color 0.2s ease;

        span {
            font-size: 10px;
            margin-top: 4px;
            font-weight: 500;
        }

        &.active {
            color: var(--accent);
        }
    }
</style>
