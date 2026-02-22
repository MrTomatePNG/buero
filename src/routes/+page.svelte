<script lang="ts">
    import Feed from "@/lib/components/Feed.svelte";
    import { ThumbsUp } from "lucide-svelte";
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
                                class="media-content"
                            ></video>
                        {:else if post.mediaType === "image"}
                            <img
                                src={post.mediaUrl}
                                alt="Post do esgoto"
                                class="media-content"
                            />
                        {:else}
                            <div class="placeholder">Mídia corrompida</div>
                        {/if}
                    </div>

                    <div class="post-info">
                        <div class="meta">
                            <span class="author">@{post.user.username}</span>

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
                        <p class="comment">{post.comment || ""}</p>
                    </div>
                </div>
            {/snippet}
        </Feed>
    {:else}
        <div class="empty-feed">
            <p>O esgoto está limpo... por enquanto.</p>
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

        .author {
            color: var(--accent);
            font-weight: bold;
            font-size: 0.95rem;
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
