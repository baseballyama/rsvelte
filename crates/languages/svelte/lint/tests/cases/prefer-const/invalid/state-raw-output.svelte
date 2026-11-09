<script>
	const a = $state.raw(0);
	let b = $derived.by(() => a);
	let c = $props.id();
</script>
{a}{b}{c}