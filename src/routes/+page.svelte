<script lang="ts">
    import { onMount } from "svelte";

    let pageVisits = 0; // Contagem de vezes que ESTE navegador visitou esta página
    let uniqueVisitors = 0; // Tentativa de contar visitantes únicos globais (com limitações)

    onMount(() => {
        // Contador de visitas da página para ESTE navegador
        let storedPageVisits = localStorage.getItem("cauldrun_page_visits");
        if (storedPageVisits) {
            pageVisits = parseInt(storedPageVisits, 10);
        }
        pageVisits++;
        localStorage.setItem("cauldrun_page_visits", pageVisits.toString());

        // Contador de visitantes únicos "global" (com as limitações do localStorage)
        let storedUniqueVisitors = localStorage.getItem(
            "cauldrun_unique_visitors_global",
        );
        let hasVisited = localStorage.getItem("cauldrun_has_visited_this_site");

        if (storedUniqueVisitors) {
            uniqueVisitors = parseInt(storedUniqueVisitors, 10);
        }

        if (!hasVisited) {
            // Se este navegador ainda não marcou que visitou o site
            uniqueVisitors++; // Incrementa o contador global de únicos
            localStorage.setItem(
                "cauldrun_unique_visitors_global",
                uniqueVisitors.toString(),
            );
            localStorage.setItem("cauldrun_has_visited_this_site", "true"); // Marca que visitou
        }
    });
</script>

<div class="work-in-progress-container">
    <div class="work-in-progress-card">
        <h1>🚧 Trabalho em Progresso 🚧</h1>
        <p>
            Esta seção do site está atualmente em construção. Agradecemos sua
            paciência enquanto preparamos algo incrível!
        </p>

        <div class="visitor-counts">
            <p>
                Você visitou esta página: <strong>{pageVisits}</strong> vez(es)
            </p>
            <p>
                Visitantes "únicos" globais: <strong>{uniqueVisitors}</strong>
            </p>
            <p class="small-text">
                (Ambos os contadores são limitados ao armazenamento do seu
                navegador e não são precisos globalmente).
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    .work-in-progress-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(
            100vh - 60px
        ); // Ajusta para a altura da nav bar se houver
        background-color: var(--bg); // Usa a cor de fundo do tema global
        color: var(--text); // Usa a cor do texto do tema global
        text-align: center;
        padding: 20px;
    }

    .work-in-progress-card {
        background-color: var(
            --surface
        ); // Usa a cor de superfície do tema para o card
        border-radius: 15px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        padding: 40px;
        max-width: 600px;
        width: 100%;
        animation: fadeIn 0.8s ease-out; // Adiciona uma animação de fade-in
        border: 2px solid var(--accent); // Borda com a cor de destaque do tema

        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: var(--accent); // Título com a cor de destaque
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.05);
        }

        p {
            font-size: 1.2em;
            line-height: 1.6;
            color: var(--text); // Texto com a cor do tema
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    // Adicione estilos para o contador de visitas
    .visitor-counts {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(var(--text), 0.1); // Linha divisória
        font-size: 0.9em;
        color: var(--text);

        p {
            margin: 5px 0;
        }

        strong {
            color: var(--accent);
        }

        .small-text {
            font-size: 0.8em;
            opacity: 0.7;
        }
    }
</style>
