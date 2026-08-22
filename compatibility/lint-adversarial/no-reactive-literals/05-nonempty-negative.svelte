<script>
	export let count;
	let arr, obj, t;
	$: arr = [count];
	$: obj = { count };
	$: t = `x${count}`;
</script>

{arr}{obj}{t}
