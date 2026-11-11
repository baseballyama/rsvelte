<script>
	let internalValue = 'x';
	let other = 1;

	export { internalValue as value, other };
	export let normal = true;

	$: combined = internalValue + other + normal;
</script>

<p>{combined}</p>
