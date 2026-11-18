<script>let { item } = $props();
import Child from './Child.svelte';</script>
<Child bind:value={item.x} />