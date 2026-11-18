<script>
	const { a } = $props();
	let b = $state(a);
	$effect(function () {
		b = a;
	});
</script>
{b}