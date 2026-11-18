<script>
	let base = $state(1);
	let v = $derived(base + 1);
</script>
{#each ["A"] as v}{#if true}{const c = String(v)}{c}{/if}{/each}