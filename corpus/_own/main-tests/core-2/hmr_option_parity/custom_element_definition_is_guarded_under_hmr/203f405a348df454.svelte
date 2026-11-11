<svelte:options customElement="my-el" />
<script>
	let { a = 1 } = $props();
</script>
<div>{a}</div>