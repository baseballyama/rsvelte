<script>
	let plain = $state({ x: 1, nested: { y: 2 } });
	let source = $state({ x: 1 });
	let key = 'x';
	let derived = $derived(source);

	function reassign() {
		source = { x: 2 };
	}
</script>

{#if key}
	<svelte:self bind:value={plain.x} />
	<svelte:self bind:value={plain.nested.y} />
	<svelte:self bind:value={plain[key]} />
	<svelte:self bind:value={source.x} />
	<svelte:self bind:value={derived.x} />
{/if}

<button onclick={reassign}>r</button>
