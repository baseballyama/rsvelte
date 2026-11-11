<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = new Map() } = $props();
</script>

<b>{typeof p}</b>
