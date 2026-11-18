<script>
	export let count;
	let a, b;
	$:a = () => count;
	$:	b = function () {
		return count;
	};
</script>

{typeof a}{typeof b}
