<!--
  Este é o layout raiz da sua aplicação.
  Ele define a estrutura geral (o "chrome" da UI) e onde o conteúdo da página será inserido.
-->
<script lang="ts">
    import "@/app.scss";
    import { MessagesSquare, CircleX, House, Bell } from "lucide-svelte";
    import type { LayoutProps } from "./$types";

    // --- PASSO 1: LÓGICA DE ESTADO ---
    // Variáveis para controlar se os painéis estão abertos ou fechados no mobile.
    let isNotificationsOpen = $state(false);
    let isChatsOpen = $state(false);
    let { children }: LayoutProps = $props();
</script>

<!-- --- PASSO 2: GATILHOS DA UI --- -->
<!-- Um menu de navegação que só aparecerá em telas pequenas -->
<div class="mobile-nav">
    <button
        onclick={() => {
            isChatsOpen = true;
        }}
    >
        <MessagesSquare />
    </button>
    <button onclick={() => {}}> <House /> </button>
    <!-- Botão de exemplo -->
    <button
        onclick={() => {
            isNotificationsOpen = true;
            isChatsOpen = false;
        }}
    >
        <Bell />
    </button>
</div>

<main class="app-container">
    <aside class="area-ranking">
        <div class="section-header">
            <span>Ranking</span>
        </div>
        <div class="section-content">
            <div class="section">Ranking / Mais Comentados</div>
            <div class="section">Options / Support</div>
        </div>
    </aside>

    {@render children()}

    <!-- Adicionamos a classe `is-open` dinamicamente -->
    <aside class="area-notifications" class:is-open={isNotificationsOpen}>
        <div class="section-header">
            <span>Notificações</span>
            <button
                class="close-btn"
                onclick={() => (isNotificationsOpen = false)}>X</button
            >
        </div>
        <div class="section-content">
            <div class="section">Pesquisa/Notificaçoes</div>
        </div>
    </aside>

    <aside class="area-chats" class:is-open={isChatsOpen}>
        <div class="section-header">
            <button class="close-btn" onclick={() => (isChatsOpen = false)}>
                <CircleX />
            </button>
        </div>
        <div class="section-content">
            <div class="section">Chats / Grupos</div>
        </div>
    </aside>
</main>

<style lang="scss">
    $gap: 8px;
    $bg-color: #1a1a1a;
    $section-bg: #2a2a2a;
    $text-color: #e0e0e0;
    $border-gray: #3a3a3a;
    $breakpoint-desktop: 768px;

    // --- PASSO 3: ESTILOS PARA OS PAINÉIS DESLIZANTES E NAV MOBILE ---
    .mobile-nav {
        display: flex; // Mostra no mobile por padrão
        justify-content: space-around;
        align-items: center;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        background-color: $section-bg;
        border-top: 1px solid $border-gray;
        z-index: 1001;

        button {
            background: none;
            border: none;
            color: $text-color;
            font-size: 1rem;
            cursor: pointer;
        }

        @media (min-width: $breakpoint-desktop) {
            display: none;
        }
    }

    .app-container {
        display: block;
        height: 100vh;
        width: 100vw;
        background-color: $bg-color;
        box-sizing: border-box;
        overflow: hidden;
    }

    aside {
        display: flex;
        flex-direction: column;
        background: $section-bg;
        overflow: hidden;
    }

    // Estilos dos painéis deslizantes para mobile
    @media (max-width: ($breakpoint-desktop - 1px)) {
        .area-notifications,
        .area-chats {
            position: fixed;
            top: 0;
            height: 100%;
            width: 85%;
            z-index: 1000;
            transition: transform 0.3s ease-out;
        }

        .area-notifications {
            right: 0;
            transform: translateX(100%);
            &.is-open {
                transform: translateX(0);
            }
        }

        .area-chats {
            left: 0;
            transform: translateX(-100%);
            &.is-open {
                transform: translateX(0);
            }
        }

        .area-ranking {
            display: none;
        }
    }

    @media (min-width: $breakpoint-desktop) {
        .app-container {
            display: grid;
            padding: $gap;
            gap: $gap;
            grid-template-columns: 1fr 1.5fr 1fr;
            grid-template-rows: 1fr 13fr;
            grid-template-areas:
                "ranking   main   notif"
                "ranking   main   chats";
        }

        .area-ranking {
            grid-area: ranking;
        }
        .area-notifications {
            grid-area: notif;
        }
        .area-chats {
            grid-area: chats;
        }
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        border-bottom: 1px solid $border-gray;
        color: $text-color;
        flex-shrink: 0;

        .close-btn {
            background: none;
            border: none;
            color: $text-color;
            font-size: 1.2rem;
            cursor: pointer;
            @media (min-width: $breakpoint-desktop) {
                display: none;
            }
        }
    }

    .section-content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }

    .section {
        padding: 20px;
        color: $text-color;
        font-size: 14px;
        border-bottom: 1px solid $border-gray;

        &:last-child {
            border-bottom: none;
        }
    }
</style>
