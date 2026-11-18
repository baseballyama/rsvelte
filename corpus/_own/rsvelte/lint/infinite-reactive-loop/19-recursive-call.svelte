<script>
	let n = 0;
	function ping() {
		queueMicrotask(() => {
			n = n + 1;
			pong();
		});
	}
	function pong() {
		ping();
	}
	$: if (n >= 0) ping();
</script>

{n}
