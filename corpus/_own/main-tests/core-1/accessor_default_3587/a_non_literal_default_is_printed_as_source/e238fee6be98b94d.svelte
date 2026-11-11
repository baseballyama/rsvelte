<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = void 0 } = $props();
</script>

<b>{typeof p}</b>
