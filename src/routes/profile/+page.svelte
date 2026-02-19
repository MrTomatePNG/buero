<script lang="ts">
    import type { PageData } from "./$types";
    import { User } from "lucide-svelte";
    import { authClient } from "@/lib/auth-client";
    import { DoorOpenIcon } from "lucide-svelte";
    import { router } from "better-auth/api";
    import { goto } from "$app/navigation";
    export let data: PageData;
    const { user } = data;
</script>

<div class="profile-page">
    {#if user}
        <div class="profile-card">
            <div class="profile-image-container">
                {#if user.image}
                    <img
                        src={user.image}
                        alt="{user.name}'s profile"
                        class="profile-image"
                    />
                {:else}
                    <User size={96} class="profile-placeholder-icon" />
                {/if}
            </div>
            <h1 class="profile-name">{user.name}</h1>
            <p class="profile-email">{user.email}</p>
            {#if user.emailVerified}
                <span class="email-verified">E-mail verificado</span>
            {:else}
                <span class="email-not-verified">E-mail não verificado</span>
            {/if}
        </div>
        <div>
            <button
                onclick={() => {
                    authClient.signOut({
                        fetchOptions: {
                            onSuccess: () => {
                                goto("/");
                            },
                        },
                    });
                }}
            >
                <DoorOpenIcon /> sair
            </button>
        </div>
    {:else}
        <p>Por favor, faça login para ver seu perfil.</p>
    {/if}
</div>

<style lang="scss">
    // Não precisamos mais de @use "sass:color"; pois não estamos manipulando cores com Sass.

    // Variáveis SCSS fixas que não dependem do tema
    $success-color: #28a745;
    $warning-color: #ffc107;
    $shadow: rgba(0, 0, 0, 0.1);

    .profile-page {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
        min-height: calc(100vh - 60px);
        background-color: var(--bg); // Usa a cor de fundo do tema global

        .profile-card {
            background-color: var(
                --surface
            ); // Usa a cor de superfície do tema para o card
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px $shadow;
            text-align: center;
            max-width: 400px;
            width: 100%;
            margin-top: 50px;

            .profile-image-container {
                margin-bottom: 20px;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                overflow: hidden;
                // Cor de fundo neutra ou baseada em --bg para o placeholder
                background-color: var(--bg);
                display: flex;
                justify-content: center;
                align-items: center;
                margin-left: auto;
                margin-right: auto;
                border: 3px solid var(--accent); // Usa a cor de destaque do tema

                .profile-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .profile-placeholder-icon {
                    color: var(--text); // Usa a cor de texto do tema
                    opacity: 0.6; // Opacidade para suavizar
                }
            }

            .profile-name {
                font-size: 2em;
                margin-bottom: 10px;
                color: var(--text); // Usa a cor de texto principal do tema
            }

            .profile-email {
                font-size: 1.1em;
                color: var(
                    --text-muted
                ); // Usa a cor de texto secundária (muted) do tema
                margin-bottom: 15px;
            }

            .email-status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 0.9em;
                margin-top: 10px;
            }

            .email-verified {
                @extend .email-status;
                background-color: $success-color;
                color: white;
            }

            .email-not-verified {
                @extend .email-status;
                background-color: $warning-color;
                color: var(--text); // Usa a cor de texto principal do tema
            }
        }
    }
</style>
