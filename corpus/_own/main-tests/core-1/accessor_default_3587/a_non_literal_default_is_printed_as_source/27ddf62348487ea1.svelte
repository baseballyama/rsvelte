<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = { a: { b: 1 } } } = $props();
</script>

<b>{typeof p}</b>
