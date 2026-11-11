<svelte:options runes={false} />

<script>
	export let count = 0;
</script>

<p>{$inspect(count)}</p>
