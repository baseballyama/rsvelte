<script>
	export let a;
	async function f() {
		for await (const x of gen()) {
			use(x);
		}
	}
</script>
