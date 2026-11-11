<script>
	export let count;
	$: current = String(count);
</script>

<input bind:value={current} />
