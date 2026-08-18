<script>
	export let seed;
	let a;
	$: a = 'init';
	$: b = seed + a;
</script>

{b}
