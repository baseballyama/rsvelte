<svelte:options accessors />

<script>
	let { p = { a: 1 } } = $props();
</script>

<b>{typeof p}</b>
