<svelte:options customElement="my-el" />
<script>
	let n = $state(1);
	let d = $derived(n * 2);
</script>
<p>{d}</p>
