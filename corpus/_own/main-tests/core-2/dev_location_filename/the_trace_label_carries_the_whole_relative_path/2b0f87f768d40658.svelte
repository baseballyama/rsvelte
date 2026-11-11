<script>
	let obj = $state({ a: 1 });
	function f() {
		$inspect.trace();
		obj.a;
	}
	f();
</script>
<p>{obj.a}</p>
