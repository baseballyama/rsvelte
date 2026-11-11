<svelte:options runes={true} />

<script>
	let n = $state(1);
</script>

{#if n}
	{@const d = $derived(n * 2)}
	{@const plain = n + 1}
	<span>{d}{plain}</span>
	<button onclick={() => n++}>+</button>
{/if}
