<script>
	let a = $state(1);
	let items = $state([1, 2]);
</script>

{#each items as item}
	<p>{$derived.by(() => item + a)}</p>
{/each}

{#if a}
	<p>{$derived.by(() => a * 2)}</p>
{/if}

{#snippet row(n)}
	<p>{$derived.by(() => n + a)}</p>
{/snippet}

{@render row(a)}
