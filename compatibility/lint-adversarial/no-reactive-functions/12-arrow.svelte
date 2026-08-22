<script>
	export let count;
	let fn;
	$: fn = () => count * 2;
</script>

{fn()}
