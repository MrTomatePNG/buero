<script lang="ts">
    import { User, DoorOpenIcon } from "lucide-svelte";
    import { authClient } from "@/lib/auth-client";
    import { goto } from "$app/navigation";

    let { data } = $props();
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

            <div class="actions">
                <button
                    class="logout-btn"
                    onclick={() => {
                        authClient.signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    goto("/login");
                                },
                            },
                        });
                    }}
                >
                    <DoorOpenIcon size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    {:else}
        <div class="login-prompt">
            <p>Por favor, faça login para ver seu perfil.</p>
            <a href="/login" class="login-btn">Ir para Login</a>
        </div>
    {/if}
</div>

<style lang="scss">
    $success-color: #28a745;
    $warning-color: #ffc107;
    $shadow: rgba(0, 0, 0, 0.1);

    .profile-page {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
        height: 100%; // Fixa no container do Shell
        background-color: var(--bg);
        overflow-y: auto; // Permite scroll se o card for muito grande em telas pequenas

        .profile-card {
            background-color: var(--surface);
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px $shadow;
            text-align: center;
            max-width: 400px;
            width: 100%;
            margin-top: 20px;
            border: 1px solid rgba(var(--text-muted), 0.1);

            .profile-image-container {
                margin-bottom: 20px;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                overflow: hidden;
                background-color: var(--bg);
                display: flex;
                justify-content: center;
                align-items: center;
                margin-left: auto;
                margin-right: auto;
                border: 3px solid var(--accent);

                .profile-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .profile-placeholder-icon {
                    color: var(--text);
                    opacity: 0.6;
                }
            }

            .profile-name {
                font-size: 1.8em;
                margin-bottom: 10px;
                color: var(--text);
            }

            .profile-email {
                font-size: 1em;
                color: var(--text-muted);
                margin-bottom: 15px;
            }

            .email-status {
                display: inline-block;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.8em;
                font-weight: bold;
            }

            .email-verified {
                @extend .email-status;
                background-color: rgba($success-color, 0.1);
                color: $success-color;
                border: 1px solid $success-color;
            }

            .email-not-verified {
                @extend .email-status;
                background-color: rgba($warning-color, 0.1);
                color: $warning-color;
                border: 1px solid $warning-color;
            }

            .actions {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(var(--text-muted), 0.1);

                .logout-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    background-color: transparent;
                    color: #ff4444;
                    border: 1px solid #ff4444;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;

                    &:hover {
                        background-color: #ff4444;
                        color: white;
                    }
                }
            }
        }
    }

    .login-prompt {
        text-align: center;
        margin-top: 100px;
        
        .login-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: var(--accent);
            color: var(--bg);
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
        }
    }
</style>
