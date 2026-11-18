<script>
	const { a } = $props();
	let { b } = $state({ b: 1 });
	$effect(() => {
		b = a;
	});
</script>
{b}