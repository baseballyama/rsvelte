<script>
	import C from './C.svelte';
	let { show = true, label = 'a' } = $props();
</script>

{#snippet dot(r)}
	<circle {r} />
{/snippet}

<C>
	<rect width="1" height={show ? 1 : 2} />
	{@render dot(2)}
</C>
<div><path d="M0 0" viewBox="0 0 1 1" class={label} /></div>
<svg viewBox="0 0 1 1"><foo>{#if show}<circle r="1" />{/if}</foo></svg>
{#if show}<ellipse rx="1" />{/if}
