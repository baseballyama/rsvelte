<script>
	import C from './01-basic-empty.svelte';
	let ok = true;
	let tag = 'div';
</script>

<C class={ok ? 'a' : ''} />
<svelte:element this={tag} class={ok ? 'a' : ''}>1</svelte:element>
<svelte:element this="span" class="x {ok ? 'a' : ''}">2</svelte:element>
