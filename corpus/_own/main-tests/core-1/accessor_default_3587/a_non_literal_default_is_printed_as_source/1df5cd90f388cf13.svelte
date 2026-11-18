<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = /re/g } = $props();
</script>

<b>{typeof p}</b>
