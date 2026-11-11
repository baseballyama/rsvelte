<script>
	let { a: [b, c] } = { a: [1, 2] };
	function f() {
		b++;
	}
</script>
<button onclick={f}>{b}{c}</button>