<script>
	let a = $state(1);
	const b = $derived({ a });
	const c = $derived['by'](() => a);
</script>
{b}{c}