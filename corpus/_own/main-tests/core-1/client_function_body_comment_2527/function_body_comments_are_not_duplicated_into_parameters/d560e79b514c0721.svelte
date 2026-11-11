<script>
	let n = $state(0);
	function a(x) { return (g(/* c */ x)); }
	function b(x) { return (x + /* c */ n) * 2; }
	function c(x) { return ((/* c */ x)); }
	function d(x) { return (x /* c */); }
</script>
<p>{n}</p>