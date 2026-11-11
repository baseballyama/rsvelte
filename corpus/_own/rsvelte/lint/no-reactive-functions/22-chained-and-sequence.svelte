<script>
	export let count;
	let a, b;
	$: a = b = () => count;
	$: ((a = () => count), (b = 1));
</script>

{typeof a}{b}
