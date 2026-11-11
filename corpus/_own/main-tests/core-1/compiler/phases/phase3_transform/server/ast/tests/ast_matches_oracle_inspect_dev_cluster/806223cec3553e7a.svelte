<script>
	let { push } = $props();
	let x = $state('x');
	let y = $derived(x.toUpperCase());
	$inspect(y).with(push);
</script>
<button onclick={() => x += 'x'}>{x}</button>