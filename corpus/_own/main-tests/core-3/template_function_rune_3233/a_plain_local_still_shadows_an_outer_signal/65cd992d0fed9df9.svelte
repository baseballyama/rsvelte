<script>
	let count = $state(1);
	function use(a) { return a; }
	function bump() { count += 1; }
</script>

<b onclick={() => { let count = 1; use(count); bump(); }}>{count}</b>
