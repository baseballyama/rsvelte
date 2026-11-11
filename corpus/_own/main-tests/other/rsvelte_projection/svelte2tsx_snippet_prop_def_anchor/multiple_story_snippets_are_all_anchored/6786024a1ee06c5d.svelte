<script lang="ts">import List from './List.svelte';</script>
<List>
{#snippet a()}<p>A</p>{/snippet}
{#snippet b(x)}<p>{x}</p>{/snippet}
</List>