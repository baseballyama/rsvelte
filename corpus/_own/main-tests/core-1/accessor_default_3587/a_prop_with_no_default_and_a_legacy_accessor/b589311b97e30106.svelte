<svelte:options accessors runes={false} />

<script>
	export let p = { a: 1 };
</script>

<b>{typeof p}</b>
