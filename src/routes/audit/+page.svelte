<script lang="ts">
    import { enhance } from "$app/forms";
    import {
        Check,
        X,
        ShieldAlert,
        User,
        ArrowLeft,
        LoaderCircle,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let { data } = $props();
    let isLoading = $state<string | null>(null); // Armazena o ID do post sendo processado
</script>

<div class="audit-page">
    <header class="header">
        <div class="top-row">
            <button onclick={() => goto("/profile")} class="back-btn">
                <ArrowLeft size={20} />
            </button>
            <h1>Câmara de Auditoria</h1>
        </div>
        <p>Posts pendentes na fila: {data.queue.length}</p>
    </header>

    {#if data.queue.length === 0}
        <div class="empty-state">
            <p>O esgoto está limpo. Nenhum post pendente.</p>
            <button onclick={() => goto("/profile")} class="btn-minimal"
                >Voltar ao Perfil</button
            >
        </div>
    {:else}
        <div class="queue-grid">
            {#each data.queue as post (post.id)}
                <div
                    class="audit-card"
                    class:processing={isLoading === post.id.toString()}
                >
                    <div class="media-container">
                        {#if post.mediaType === "video"}
                            <video
                                src={post.mediaUrl}
                                muted
                                autoplay
                                loop
                                playsinline
                                controls
                            ></video>
                        {:else}
                            <img
                                src={post.mediaUrl}
                                alt="Preview"
                                onerror={(e) => {
                                    console.error(
                                        "Erro ao carregar imagem:",
                                        post.mediaUrl,
                                    );
                                    (e.currentTarget as HTMLImageElement).src =
                                        "https://placehold.co/400x400/161616/da8a67?text=Erro+no+S3";
                                }}
                            />
                        {/if}
                        {#if isLoading === post.id.toString()}
                            <div class="loading-overlay">
                                <LoaderCircle size={32} class="spinner" />
                            </div>
                        {/if}
                    </div>

                    <div class="info">
                        <div class="user">
                            <User size={14} />
                            <span>@{post.user.username}</span>
                        </div>
                        <p class="comment">{post.comment || "Sem legenda"}</p>
                    </div>

                    <div class="actions">
                        <form
                            method="POST"
                            action="?/moderate"
                            use:enhance={() => {
                                isLoading = post.id.toString();
                                return async ({ update }) => {
                                    await update();
                                    isLoading = null;
                                };
                            }}
                        >
                            <input
                                type="hidden"
                                name="postId"
                                value={post.id}
                            />

                            <button
                                name="action"
                                value="approve"
                                class="btn approve"
                                title="Aprovar"
                            >
                                <Check size={20} />
                            </button>

                            <button
                                name="action"
                                value="reject"
                                class="btn reject"
                                title="Rejeitar"
                            >
                                <X size={20} />
                            </button>

                            <button
                                name="action"
                                value="ban"
                                class="btn ban"
                                title="Banir Post e Marcar como Ilicito"
                            >
                                <ShieldAlert size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .audit-page {
        padding: 20px;
        height: 100%;
        overflow-y: auto;
        background-color: var(--bg);
    }

    .header {
        margin-bottom: 30px;
        .top-row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 8px;
        }
        h1 {
            color: var(--accent);
            margin: 0;
            font-size: 1.5rem;
        }
        p {
            color: var(--text-muted);
            font-size: 0.9rem;
        }
    }

    .back-btn {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
            border-color: var(--accent);
            color: var(--accent);
        }
    }

    .queue-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }

    .audit-card {
        background: var(--surface);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        transition: opacity 0.3s;

        &.processing {
            opacity: 0.5;
            pointer-events: none;
        }

        .media-container {
            aspect-ratio: 1;
            background: #000;
            position: relative;

            img,
            video {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .info {
            padding: 12px;
            flex: 1;
            .user {
                display: flex;
                align-items: center;
                gap: 6px;
                color: var(--secondary);
                font-size: 0.8rem;
                margin-bottom: 8px;
            }
            .comment {
                font-size: 0.9rem;
                color: var(--text);
            }
        }

        .actions {
            padding: 12px;
            background: rgba(0, 0, 0, 0.2);
            form {
                display: flex;
                gap: 10px;
            }

            .btn {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                transition:
                    transform 0.1s,
                    filter 0.2s;

                &:active {
                    transform: scale(0.95);
                }
                &:hover {
                    filter: brightness(1.2);
                }

                &.approve {
                    background: #28a745;
                    color: white;
                }
                &.reject {
                    background: #666;
                    color: white;
                }
                &.ban {
                    background: #dc3545;
                    color: white;
                }
            }
        }
    }

    .empty-state {
        text-align: center;
        margin-top: 100px;
        color: var(--text-muted);
        .btn-minimal {
            margin-top: 20px;
            background: none;
            border: 1px solid var(--accent);
            color: var(--accent);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
        }
    }

    :global(.spinner) {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
