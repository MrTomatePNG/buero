<!--
  Este é o conteúdo da página principal.
  Ele será automaticamente injetado no <slot /> do `+layout.svelte`.
-->
<article class="area-main">
    <nav class="tabs">novidades / aleatorios / seguindo</nav>
    <div class="scroll-content">
        {#each Array(20) as _, i}
            <div class="item">Item {i + 1}</div>
        {/each}
    </div>
</article>

<style lang="scss">
    @use "sass:math"; // Estilos específicos do conteúdo principal.
    // O container .area-main é posicionado pelo grid no `+layout.svelte`.
    $section-bg: #2a2a2a;
    $text-color: #e0e0e0;
    $border-gray: #3a3a3a;
    $breakpoint-desktop: 768px;

    .area-main {
        grid-area: main; // Usado pelo grid do layout no desktop
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        position: relative;
        background: $section-bg;

        // No mobile, ele deve ocupar toda a altura
        @media (max-width: ($breakpoint-desktop, 1px)) {
            height: 100vh;
        }
    }

    .tabs {
        padding: 16px 20px;
        color: $text-color;
        font-size: 14px;
        border-bottom: 1px solid $border-gray;
        background: $section-bg;
    }

    .scroll-content {
        flex: 1;
        overflow-y: auto;
        padding: 0;
    }

    .item {
        padding: 16px 20px;
        color: $text-color;
        font-size: 13px;
        border-bottom: 1px solid $border-gray;

        &:last-child {
            border-bottom: none;
        }
    }
</style>
