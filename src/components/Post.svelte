<script lang="ts">
    let { id, text }: { id: number; text: string } = $props();
</script>

<div class="post">
    <span class="id">#{id}</span>
    <p class="content">{text}</p>
</div>

<style lang="scss">
    .post {
        padding: 16px 20px;
        color: #e0e0e0;
        font-size: 13px;
        border-bottom: 1px solid #3a3a3a;
        display: flex;
        gap: 12px;
        height: 100vh;
        align-items: flex-start;

        .id {
            color: #888;
            font-weight: bold;
            min-width: 40px;
        }

        .content {
            margin: 0;
            line-height: 1.4;
        }

        &:last-child {
            border-bottom: none;
        }
    }
</style>
