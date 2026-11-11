<script>let { item } = $props();
import Child from './Child.svelte';</script>
<!-- svelte-ignore ownership_invalid_mutation -->
<input bind:value={item.heading} />