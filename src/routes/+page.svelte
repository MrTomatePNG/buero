<script lang="ts">
    import Feed from "@/lib/components/Feed.svelte";
    import { ThumbsUp, Trash2 } from "lucide-svelte";
    import { enhance } from "$app/forms";

    let { data } = $props();
</script>

<div class="page-container">
    {#if data.posts.length > 0}
        <Feed items={data.posts}>
            {#snippet children(post)}
                <div class="post-card">
                    <div class="media-container">
                        {#if post.mediaType === "video"}
                            <video
                                src={post.mediaUrl}
                                poster={post.thumbUrl}
                                controls
                                loop
                                playsinline
                                crossorigin="anonymous"
                                class="media-content"
                            ></video>
                        {:else if post.mediaType === "image"}
                            <img
                                src={post.mediaUrl}
                                alt="Post"
                                class="media-content"
                            />
                        {:else}
                            <div class="placeholder">Mídia corrompida</div>
                        {/if}
                    </div>

                    <div class="post-info">
                        <div class="meta">
                            <span class="author">@{post.user.username}</span>

                            <div class="actions-group">
                                {#if data.user && (data.user.id === post.userId || data.user.role === 'admin')}
                                    <form method="POST" action="?/deletePost" use:enhance={() => {
                                        if (!confirm('Tem certeza que quer apagar esse meme?')) return;
                                        return async ({ update }) => {
                                            await update();
                                        };
                                    }}>
                                        <input type="hidden" name="postId" value={post.id} />
                                        <button type="submit" class="delete-btn" title="Apagar Post">
                                            <Trash2 size={22} />
                                        </button>
                                    </form>
                                {/if}

                                <form method="POST" action="?/like" use:enhance>
                                    <input
                                        type="hidden"
                                        name="postId"
                                        value={post.id}
                                    />
                                    <button
                                        type="submit"
                                        class="like-btn"
                                        class:liked={post.isLiked}
                                    >
                                        <ThumbsUp
                                            size={24}
                                            fill={post.isLiked
                                                ? "var(--accent)"
                                                : "none"}
                                        />
                                        <span>{post.likesCount}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                        <p class="comment">{post.comment || ""}</p>
                    </div>
                </div>
            {/snippet}
        </Feed>
    {:else}
        <div class="empty-feed">
            <p>Nenhum post encontrado.</p>
            <a href="/studio" class="btn">Postar algo</a>
        </div>
    {/if}
</div>

<style lang="scss">
    .page-container {
        width: 100%;
        height: 100%;
        background-color: var(--bg);
    }

    .post-card {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #000;
    }

    .media-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .media-content {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }

    .post-info {
        padding: 20px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;

        .meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .actions-group {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .author {
            color: var(--accent);
            font-weight: bold;
            font-size: 0.95rem;
        }

        .delete-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: all 0.2s;
            &:hover {
                color: #ff4444;
                transform: scale(1.1);
            }
        }

        .like-btn {
            background: none;
            border: none;
            color: white;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: transform 0.1s ease;

            span {
                font-size: 0.9rem;
                font-weight: bold;
            }

            &:active {
                transform: scale(1.2);
            }
            &.liked {
                color: var(--accent);
            }
        }

        .comment {
            color: #eee;
            font-size: 1rem;
            line-height: 1.4;
        }
    }

    .empty-feed {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-muted);

        .btn {
            margin-top: 20px;
            padding: 10px 20px;
            background: var(--accent);
            color: var(--bg);
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
        }
    }
</style>
