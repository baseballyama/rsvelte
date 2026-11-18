<script>
	import C from './01-bind-class-basic.svelte';
	let value = 'v';
	let active = true;
	let tag = 'div';
	let innerWidth = 0;
</script>

<C bind:value={value} />
<svelte:element this={tag} class:active={active}>special</svelte:element>
<svelte:window bind:innerWidth={innerWidth} />
