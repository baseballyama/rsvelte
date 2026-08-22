<script>
	export let count;
	let fn;
	$: fn = (() => count);
</script>

{fn()}
