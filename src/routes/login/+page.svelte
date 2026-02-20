<script lang="ts">
    import { authClient } from "@/lib/auth-client";
    import { goto } from "$app/navigation";

    // --- ESTADO ---
    let isLogin = $state(true);
    let isLoading = $state(false);
    let serverError = $state("");

    let email = $state("");
    let password = $state("");
    let name = $state("");

    // --- VALIDAÇÃO ---
    const isValid = $derived(
        isLogin 
            ? (email.includes("@") && password.length > 0)
            : (email.includes("@") && password.length >= 8 && name.length > 1)
    );

    // --- AÇÃO ---
    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (!isValid || isLoading) return;

        isLoading = true;
        serverError = "";

        const { error } = isLogin 
            ? await authClient.signIn.email({ email, password, callbackURL: "/" })
            : await authClient.signUp.email({ email, password, name, callbackURL: "/" });

        if (error) {
            serverError = error.message || "Erro de autenticação";
            isLoading = false;
        } else {
            goto("/");
        }
    }
</script>

<div class="container">
    <form onsubmit={handleSubmit} class="auth-form">
        <h1 class="title">{isLogin ? "Login" : "Cadastro"}</h1>
        
        {#if serverError}
            <p class="error-text">{serverError}</p>
        {/if}

        <div class="fields">
            {#if !isLogin}
                <input 
                    type="text" 
                    placeholder="Username" 
                    bind:value={name} 
                    class="minimal-input"
                    autocomplete="name"
                />
            {/if}

            <input 
                type="email" 
                placeholder="E-mail" 
                bind:value={email} 
                class="minimal-input"
                autocomplete="email"
            />

            <input 
                type="password" 
                placeholder="Senha" 
                bind:value={password} 
                class="minimal-input"
                autocomplete={isLogin ? "current-password" : "new-password"}
            />
        </div>

        <button type="submit" class="submit-btn" disabled={!isValid || isLoading}>
            {isLoading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
        </button>

        <button type="button" onclick={() => (isLogin = !isLogin)} class="toggle-btn">
            {isLogin ? "Não tenho conta" : "Já sou cadastrado"}
        </button>
    </form>
</div>

<style lang="scss">
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background-color: var(--bg);
    }

    .auth-form {
        width: 100%;
        max-width: 320px;
        padding: 20px;
        display: flex;
        flex-direction: column;
    }

    .title {
        font-size: 1.5rem;
        font-weight: 500;
        margin-bottom: 2rem;
        color: var(--text);
        letter-spacing: -0.02em;
    }

    .fields {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 2rem;
    }

    .minimal-input {
        background: var(--surface);
        border: 1px solid rgba(var(--text-muted), 0.1);
        padding: 14px;
        border-radius: 8px;
        color: var(--text);
        font-size: 0.95rem;
        transition: all 0.2s ease;

        &:focus {
            outline: none;
            border-color: var(--accent);
            background: var(--bg);
        }

        &::placeholder {
            color: var(--text-muted);
            opacity: 0.5;
        }
    }

    .submit-btn {
        background-color: var(--accent);
        color: var(--bg);
        border: none;
        padding: 14px;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.1s active;

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        &:active:not(:disabled) {
            transform: scale(0.98);
        }
    }

    .toggle-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        margin-top: 1.5rem;
        font-size: 0.85rem;
        cursor: pointer;
        align-self: center;
        transition: color 0.2s;

        &:hover {
            color: var(--accent);
        }
    }

    .error-text {
        background-color: rgba(#ff4444, 0.1);
        color: #ff4444;
        padding: 10px;
        border-radius: 6px;
        font-size: 0.85rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(#ff4444, 0.2);
    }
</style>
