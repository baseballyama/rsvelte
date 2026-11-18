<script>
	let a = $state(1);

	function f() {
		// leading
		$effect(() => {
			// interior
			console.log(a);
		});
	}

	f();
</script>

<p>{a}</p>
