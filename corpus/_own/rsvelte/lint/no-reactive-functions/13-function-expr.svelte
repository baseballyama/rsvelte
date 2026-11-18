<script>
	export let count;
	let fn;
	$: fn = function () {
		return count;
	};
</script>

{fn()}
