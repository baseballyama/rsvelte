<script>
	function f() { return 1; }
	export let v = f() // trailing here
	export let w = 2;
</script>
<p>{v}{w}</p>
