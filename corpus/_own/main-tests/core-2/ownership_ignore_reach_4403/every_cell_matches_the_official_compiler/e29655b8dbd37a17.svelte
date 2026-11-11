<script>let { item } = $props();
import Child from './Child.svelte';</script>
<svelte:window bind:scrollY={item.y} />