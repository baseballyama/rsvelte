<script>
	import C from './C.svelte';
	let { show = true, w = 1 } = $props();
	let items = $state([1]);
</script>

<C --w="{w}px" />
{#if show}<C --a={items.length} />{/if}
{#each items as item}<C --b={item} c={item}>{item}</C>{/each}
<div><C --x={Math.max(w, 2)} /></div>
