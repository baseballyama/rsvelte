<script>
	let v = $state({ x: 1 });
	function r() { v = { x: 2 }; }
</script>

{#if true}<svelte:self bind:value={v.x} />{/if}<button onclick={r}>r</button>
