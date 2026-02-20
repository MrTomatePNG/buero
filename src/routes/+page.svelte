<script lang="ts">
    import { onMount } from "svelte";
    let visits = $state(0);

    onMount(() => {
        const stored = localStorage.getItem("visits") || "0";
        visits = parseInt(stored) + 1;
        localStorage.setItem("visits", visits.toString());
    });
</script>

<div class="page-container">
    <div class="card">
        <h1>🚧 Cauldron 🚧</h1>
        <p>Desenvolvimento em progresso.</p>
        <div class="stats">
            Visitas: <span>{visits}</span>
        </div>
    </div>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: var(--bg);
        padding: 20px;
    }

    .card {
        background-color: var(--surface);
        border-radius: 16px;
        padding: 40px;
        width: 100%;
        max-width: 400px;
        text-align: center;
        border: 2px solid var(--accent);
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);

        h1 { color: var(--accent); margin-bottom: 1rem; }
        p { color: var(--text); font-size: 1.1rem; }
        
        .stats {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: var(--text-muted);
            span { color: var(--accent); font-weight: bold; }
        }
    }
</style>
