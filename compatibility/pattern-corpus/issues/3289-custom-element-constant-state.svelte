<svelte:options customElement="my-el" />

<script>
	let n = $state(1);
	let d = $derived(2);
</script>

<p>{n}</p>
<p title={d}></p>
