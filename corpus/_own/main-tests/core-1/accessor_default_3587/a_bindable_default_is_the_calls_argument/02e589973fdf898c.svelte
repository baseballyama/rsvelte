<svelte:options customElement={{ tag: "my-x" }} />

<script>
	let { p = $bindable({ a: 1 }) } = $props();
</script>

<b>{typeof p}</b>
