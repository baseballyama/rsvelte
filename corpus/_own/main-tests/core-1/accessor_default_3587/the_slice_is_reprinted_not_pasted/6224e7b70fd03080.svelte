<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = {
		a: 1,
		b: 2
	} } = $props();
</script>

<b>{typeof p}</b>
