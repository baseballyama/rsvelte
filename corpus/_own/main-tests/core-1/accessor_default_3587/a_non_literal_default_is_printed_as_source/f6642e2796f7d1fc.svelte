<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = `t${1}` } = $props();
</script>

<b>{typeof p}</b>
