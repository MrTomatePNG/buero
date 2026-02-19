<script lang="ts">
    // Não há script complexo necessário para esta página de "em breve".
    // Se no futuro você precisar adicionar lógica aqui, pode fazê-lo.
</script>

<div class="coming-soon-container">
    <div class="coming-soon-card">
        <span class="icon">🚀</span>
        <h1>Em Breve!</h1>
        <p>Não tem nada ainda.... Mas vai ter.</p>
        <p>
            Estamos trabalhando duro para trazer a você uma experiência incrível
            de chat.
        </p>
    </div>
</div>

<style lang="scss">
    .coming-soon-container {
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

    .coming-soon-card {
        background-color: var(--surface); // Usa a cor de superfície para o card
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        padding: 50px;
        max-width: 550px;
        width: 100%;
        animation: fadeIn 0.8s ease-out;
        border: 3px solid var(--accent); // Borda com a cor de destaque verde
    }

    .icon {
        font-size: 4em;
        display: block;
        margin-bottom: 20px;
        animation: bounce 1.5s infinite ease-in-out;
    }

    h1 {
        font-size: 3em;
        margin-bottom: 15px;
        color: var(--accent); // Título com a cor de destaque
        font-weight: 700;
        text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    }

    p {
        font-size: 1.2em;
        line-height: 1.6;
        color: var(--text-muted); // Usa a cor de texto secundária
        margin-bottom: 10px;
    }

    p:last-child {
        margin-bottom: 0;
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

    @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-30px);
        }
        60% {
            transform: translateY(-15px);
        }
    }
</style>
