<script>
	export let count;
	let a, b, c;
	$: a = async () => count;
	$: b = async function () {
		return count;
	};
	$: c = function* () {
		yield count;
	};
</script>

{typeof a}{typeof b}{typeof c}
