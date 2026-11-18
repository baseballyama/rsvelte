<script>let { item } = $props();
import Child from './Child.svelte';</script>
<svelte:body bind:clientWidth={item.w} />