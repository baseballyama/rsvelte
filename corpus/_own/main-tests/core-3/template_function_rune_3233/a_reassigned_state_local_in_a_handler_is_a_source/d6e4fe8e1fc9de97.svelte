<script>
	let v = $state(1);
	function use(a) { return a; }
</script>

<b onclick={() => { let x = $state(1); x = 2; use(x); }}>{v}</b>
