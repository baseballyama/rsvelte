<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = $bindable(1 + 1) } = $props();
</script>

<b>{typeof p}</b>
