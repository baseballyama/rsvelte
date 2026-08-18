<svelte:options runes={true} />

<script>
	const 項目 = [1, 2];
</script>

{#each 項目 as n (n)}
	テキスト😀{@const 倍 = n * 2}<span>{倍}</span>
{/each}
