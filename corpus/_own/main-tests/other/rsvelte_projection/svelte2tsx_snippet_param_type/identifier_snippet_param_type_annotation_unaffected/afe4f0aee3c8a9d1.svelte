<script lang="ts">let v = 1;</script>
{#snippet item(id: string)}
<button>{id}{v}</button>
{/snippet}
{@render item('a')}