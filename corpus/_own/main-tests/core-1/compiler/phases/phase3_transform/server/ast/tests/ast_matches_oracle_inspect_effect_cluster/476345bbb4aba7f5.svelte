<script>
	let count = $state(0);
	$effect(() => {
		let double = $derived(count * 2)
		console.log('init ' + double);
		return function() { console.log('cleanup ' + double); };
	})
</script>
<button onclick={() => count++ }>Click</button>