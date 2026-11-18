<script>
	let n = $state(0);
	async function f(xs) {
		for await (const x of /* it */ xs) { // first
			n += x;
		}
	}
</script>
<button onclick={() => f([])}>{n}</button>
