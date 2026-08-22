<script>
	export let count;
	let obj = {};
	$: obj.fn = () => count;
</script>

{count}
