<script>
	let shown = $state(true);
	let start = $state(3);
</script>

{let n = $state(0), twice = $derived(n * 2)}
<button onclick={() => n++}>{n} {twice}</button>

{#if shown}
	{let box = $state({ v: start })}
	{const label = 'v: '}
	<p onclick={() => box.v++}>{label}{box.v}</p>
	<section>
		{const label = 'inner'}
		{let t = $derived(twice + 1)}
		<i>{label} {t}</i>
	</section>
{/if}

{#each [1, 2] as item}
	{let el = $state()}
	<b bind:this={el}>{item}</b>
{/each}
