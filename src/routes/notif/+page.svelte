<script lang="ts">
    // Página de Notificações
</script>

<div class="coming-soon-container">
    <div class="coming-soon-card">
        <span class="icon">🔔</span>
        <h1>Notificações</h1>
        <p>Suas interações aparecerão aqui em breve.</p>
    </div>
</div>

<style lang="scss">
    .coming-soon-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: var(--bg);
        padding: 20px;
    }

    .coming-soon-card {
        background-color: var(--surface);
        border-radius: 16px;
        padding: 40px;
        max-width: 90%;
        width: 400px;
        text-align: center;
        border: 2px solid var(--accent);
        
        h1 { color: var(--accent); margin: 10px 0; }
        p { color: var(--text-muted); }
        .icon { font-size: 3rem; }
    }
</style>
