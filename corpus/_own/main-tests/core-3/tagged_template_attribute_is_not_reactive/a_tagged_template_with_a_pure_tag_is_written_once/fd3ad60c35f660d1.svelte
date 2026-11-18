<script>
	let n = $state(0);
	export function go() { n++; }
	function ltag(x) { return x[0]; }
</script>
<input pattern={String.raw`${n}`} />
