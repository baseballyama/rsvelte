<script>
	const p = Promise.resolve(1);
	let n = $state(1);
</script>

{#key n}
	{@const a = n}
	{#snippet inKey()}<b>{a}</b>{/snippet}
	{@render inKey()}
{/key}

{#each [] as i}
	<u>{i}</u>
{:else}
	{@const b = n}
	{#snippet inElse()}<b>{b}</b>{/snippet}
	{@render inElse()}
{/each}

{#await p}
	{@const c = n}
	{#snippet inPending()}<b>{c}</b>{/snippet}
	{@render inPending()}
{:then v}
	{@const d = v}
	{#snippet inThen()}<b>{d}</b>{/snippet}
	{@render inThen()}
{:catch e}
	{@const f = e}
	{#snippet inCatch()}<b>{f}</b>{/snippet}
	{@render inCatch()}
{/await}

{#snippet outer()}
	{@const g = n}
	{#snippet inSnippet()}<b>{g}</b>{/snippet}
	{@render inSnippet()}
{/snippet}
{@render outer()}

<svelte:element this={'div'}>
	{@const h = n}
	{#snippet inElement()}<b>{h}</b>{/snippet}
	{@render inElement()}
</svelte:element>

<svelte:head>
	{@const i = n}
	{#snippet inHead()}<meta name="x" content={String(i)} />{/snippet}
	{@render inHead()}
</svelte:head>
