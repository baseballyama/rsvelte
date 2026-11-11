<script>let { item } = $props();
import Child from './Child.svelte';</script>
<!-- svelte-ignore ownership_invalid_mutation -->
<svelte:element this={'div'} bind:this={item.el}></svelte:element>