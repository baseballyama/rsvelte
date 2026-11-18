<script>
	let tag = $state('div');
	const tags = ['br', 'img', 'input', 'span', 'circle', 'p'];
	let el = $state(null);
	let value = $state('');
</script>

<svelte:element this={tag} class="dynamic" bind:this={el}>body</svelte:element>
<svelte:element this={tag === 'div' ? 'section' : 'article'}>ternary</svelte:element>
<svelte:element this={tags[0]} />
<svelte:element this="input" value={value} />
<svelte:element this={'h' + 1}>computed</svelte:element>

{#each tags as t}
	<svelte:element this={t} data-t={t}>{t}</svelte:element>
{/each}

<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
	<svelte:element this={'circle'} cx="5" cy="5" r="4" />
</svg>

<p>{el?.tagName ?? '-'}{value}</p>
