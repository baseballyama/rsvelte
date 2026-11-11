<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = 1n } = $props();
</script>

<b>{typeof p}</b>
