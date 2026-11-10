<svelte:options runes={false} />
<script lang="ts">
	let a = $state(1);
</script>
<div><slot name="a" /></div>