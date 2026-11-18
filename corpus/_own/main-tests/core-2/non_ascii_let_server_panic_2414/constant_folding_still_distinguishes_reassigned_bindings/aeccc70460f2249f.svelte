<script>
	let ab = 1;
	function f() { let ab2 = 0; ab = ab2 + 2; }
</script>
<p>{ab}</p><button onclick={f}>go</button>