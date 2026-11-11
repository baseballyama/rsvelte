<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = null } = $props();
</script>

<b>{typeof p}</b>
