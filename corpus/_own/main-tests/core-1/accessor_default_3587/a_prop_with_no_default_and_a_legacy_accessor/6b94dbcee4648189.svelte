<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p } = $props();
</script>

<b>{typeof p}</b>
