<svelte:options customElement="my-el" accessors />
<script>
	let n = $state(1);
</script>
<p>{n}</p>