<script>
	export let n = 0;
	async function f(xs, use) {
		for await (const x of /* it */ xs) { // first
			use(x);
		}
	}
</script>
<button onclick={() => f([], console.log)}>{n}</button>
