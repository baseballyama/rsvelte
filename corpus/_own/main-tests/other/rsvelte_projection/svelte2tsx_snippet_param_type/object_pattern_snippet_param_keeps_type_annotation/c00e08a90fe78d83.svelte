<script lang="ts">let v = 1;</script>
{#snippet menuitem({ contentId }: { contentId?: string })}
<button id={contentId}>{v}</button>
{/snippet}
{@render menuitem({})}