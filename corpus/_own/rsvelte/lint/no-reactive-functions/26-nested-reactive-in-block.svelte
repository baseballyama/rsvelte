<script>
	export let count;
	let fn, other;
	$: {
		fn = () => count;
	}
	$: if (count) other = () => count;
</script>

{typeof fn}{typeof other}
