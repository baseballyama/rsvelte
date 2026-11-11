<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = Math.max(1, 2) } = $props();
</script>

<b>{typeof p}</b>
