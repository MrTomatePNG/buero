<script lang="ts">
    import { ImagePlus, LoaderCircle, CircleCheckBig } from "lucide-svelte";
    import { enhance } from "$app/forms";
    import { fade } from "svelte/transition";
    import { createVideoThumbnail, dataUrlToFile } from "@/lib/utils/thumbs.js";

    let isLoading = $state(false);
    let success = $state(false);
    let previewUrl = $state<string | null>(null);

    let thumbnailFile = $state<File | null>(null);
    let isVideo = $state(false);

    let { data } = $props();

    const handleFileChange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        if (file.type.startsWith("video/")) {
            isVideo = true;
            previewUrl = URL.createObjectURL(file);

            const thumbnailURL = await createVideoThumbnail(file);
            thumbnailFile = dataUrlToFile(thumbnailURL, "thumbnail.jpg");
        } else {
            isVideo = false;
            previewUrl = URL.createObjectURL(file);
        }
    };
</script>

<div class="studio-page">
    <div class="studio-card">
        <header>
            <h1>Studio</h1>
            <p>Compartilhe algo com o esgoto</p>
        </header>

        {#if success}
            <div class="success-state" in:fade>
                <CircleCheckBig size={48} color="var(--accent)" />
                <h2>Post enviado!</h2>
                <p>Aguardando aprovação dos auditores.</p>
                <button
                    onclick={() => {
                        success = false;
                        previewUrl = null;
                    }}
                    class="btn-minimal">Novo post</button
                >
            </div>
        {:else if !data.user.emailVerified}
            <div class="verify-email-state" in:fade>
                <div class="icon">📧</div>
                <h2>Verifique seu E-mail</h2>
                <p>
                    O esgoto exige autenticidade. Verifique seu e-mail para
                    habilitar o upload de posts.
                </p>
                <button class="btn-minimal" onclick={() => location.reload()}
                    >Já verifiquei</button
                >
            </div>
        {:else}
            <form
                method="POST"
                action="?/upload"
                enctype="multipart/form-data"
                use:enhance={() => {
                    isLoading = true;
                    return async ({ result, update }) => {
                        isLoading = false;
                        if (result.type === "success") {
                            success = true;
                        }
                        await update();
                    };
                }}
                class="upload-form"
            >
                <label class="media-upload" class:has-preview={previewUrl}>
                    {#if previewUrl}
                        {#if isVideo}
                            <video
                                src={previewUrl}
                                muted
                                autoplay
                                loop
                                class="preview"
                            ></video>
                        {:else}
                            <img
                                src={previewUrl}
                                alt="Preview"
                                class="preview"
                            />
                        {/if}
                    {:else}
                        <div class="placeholder">
                            <ImagePlus size={32} />
                            <span>Selecionar Mídia</span>
                        </div>
                    {/if}
                    <input
                        type="file"
                        name="media"
                        accept="image/*,video/*"
                        required
                        onchange={handleFileChange}
                    />
                </label>

                <textarea
                    name="comment"
                    placeholder="Adicione um comentario..."
                    rows="3"
                ></textarea>

                <button type="submit" class="submit-btn" disabled={isLoading}>
                    {#if isLoading}
                        <LoaderCircle class="spinner" />
                        <span>Enviando...</span>
                    {:else}
                        <span>Publicar Post</span>
                    {/if}
                </button>
            </form>
        {/if}
    </div>
</div>

<style lang="scss">
    .studio-page {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding: 20px;
        background-color: var(--bg);
    }

    .studio-card {
        width: 100%;
        max-width: 400px;
        background: var(--surface);
        padding: 30px;
        border-radius: 20px;
        border: 1px solid var(--border);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

        header {
            text-align: center;
            margin-bottom: 24px;
            h1 {
                color: var(--accent);
                margin: 0;
            }
            p {
                color: var(--text-muted);
                font-size: 0.9rem;
                margin-top: 4px;
            }
        }
    }

    .upload-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .media-upload {
        width: 100%;
        aspect-ratio: 1;
        background: var(--bg);
        border: 2px dashed var(--border);
        border-radius: 12px;
        cursor: pointer;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
            border-color: var(--secondary);
        }
        &.has-preview {
            border-style: solid;
            border-color: var(--accent);
        }

        .placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            color: var(--text-muted);
            span {
                font-size: 0.85rem;
                font-weight: 500;
            }
        }

        .preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        input {
            display: none;
        }
    }

    textarea {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px;
        color: var(--text);
        font-family: inherit;
        resize: none;
        outline: none;
        &:focus {
            border-color: var(--secondary);
        }
    }

    .submit-btn {
        background: var(--accent);
        color: var(--bg);
        border: none;
        padding: 14px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: transform 0.1s;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        &:active:not(:disabled) {
            transform: scale(0.98);
        }
    }

    .success-state,
    .verify-email-state {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 20px 0;
        h2 {
            color: var(--text);
            margin: 0;
        }
        p {
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        .icon {
            font-size: 3rem;
            margin-bottom: 10px;
        }
    }

    .btn-minimal {
        background: none;
        border: 1px solid var(--secondary);
        color: var(--secondary);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 10px;
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
