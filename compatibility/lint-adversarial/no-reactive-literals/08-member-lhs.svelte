<script>
	export let count;
	let cfg = {};
	$: cfg.max = 100;
	$: void count;
</script>

{cfg.max}
