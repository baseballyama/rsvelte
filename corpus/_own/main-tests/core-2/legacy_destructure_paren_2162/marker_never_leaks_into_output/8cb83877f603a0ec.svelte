<script>
	let { foo = $bindable(1) } = $props();
	const obj = { foo: 1 };
	function f() {
		({ foo } = obj);
	}
</script>
<button onclick={f}>{foo}</button>