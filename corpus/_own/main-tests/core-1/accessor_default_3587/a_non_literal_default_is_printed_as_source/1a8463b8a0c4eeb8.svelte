<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = Symbol() } = $props();
</script>

<b>{typeof p}</b>
