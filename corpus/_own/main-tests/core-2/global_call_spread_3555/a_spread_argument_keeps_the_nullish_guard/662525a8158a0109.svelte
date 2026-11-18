<script>
	let n = $state(1);
	const xs = [1, 2];
	function foo(...a) { return a[0]; }
	function bump() { n += 1; }
	const v = Number(...[n]);
</script>
<button onclick={bump}>b</button>
<b>{v}x</b>
