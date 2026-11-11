<script>let { item } = $props();
import Child from './Child.svelte';</script>
<svelte:document bind:activeElement={item.el} />