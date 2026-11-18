<script>let { item } = $props();
import Child from './Child.svelte';</script>
<svelte:element this={'div'} bind:this={item.el}></svelte:element>