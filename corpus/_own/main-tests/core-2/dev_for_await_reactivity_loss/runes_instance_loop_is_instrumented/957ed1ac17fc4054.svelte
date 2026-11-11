<script>
	let a = $state(0);
	async function f() {
		for await (const x of gen()) {
			use(x);
		}
	}
</script>
