<svelte:options customElement="my-el" />
<script>
	let n = $derived(1);
</script>
<p>{n}</p>