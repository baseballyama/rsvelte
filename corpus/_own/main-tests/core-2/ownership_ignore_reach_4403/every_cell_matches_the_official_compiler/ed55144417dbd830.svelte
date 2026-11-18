<script>let { item } = $props();
import Child from './Child.svelte';</script>
<!-- svelte-ignore ownership_invalid_mutation -->
<svelte:body bind:clientWidth={item.w} />