<script lang="ts">
import List from './List.svelte';
</script>
<List>
{#snippet row({ id })}<p>{id}</p>{/snippet}
</List>