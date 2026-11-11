<script>
	function f(x) { return x; }
	export let v = f(1) // trailing here
	export let w = 2;
</script>
<p>{v}{w}</p>
