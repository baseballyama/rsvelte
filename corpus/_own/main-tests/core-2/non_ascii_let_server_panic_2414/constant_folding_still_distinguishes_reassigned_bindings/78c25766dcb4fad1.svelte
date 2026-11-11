<script>
	let 名前 = 1;
	function f() { let 名前2 = 0; 名前 = 名前2 + 2; }
</script>
<p>{名前}</p><button onclick={f}>go</button>