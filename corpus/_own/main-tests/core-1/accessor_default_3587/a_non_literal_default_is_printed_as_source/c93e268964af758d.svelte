<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = undefined } = $props();
</script>

<b>{typeof p}</b>
