<script>
	let c = $state({ a: 0 });
	$effect(() => {
		$effect(() => {
			if (c) { $effect(() => { c.a; }); }
		});
	});
</script>
<button>x</button>