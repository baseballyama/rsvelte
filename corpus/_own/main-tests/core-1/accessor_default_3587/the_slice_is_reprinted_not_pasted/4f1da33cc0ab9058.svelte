<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = 1 /* c */ + 2 } = $props();
</script>

<b>{typeof p}</b>
