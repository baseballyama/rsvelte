<script>
	const { foo } = $props();

	function bar() {
		return "baz";
	}
</script>

{@render foo(bar())}
