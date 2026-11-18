<script>
	let el;
	function act(node) {
		node.addEventListener('a', () => {});
		return {};
	}
	const cond = true;
</script>

<div bind:this={el} use:act={el.addEventListener('b', () => {})}></div>

{#if el.addEventListener('c', () => {})}
	<p>if</p>
{/if}

{#each [el.addEventListener('d', () => {})] as row}
	<p>{row}</p>
{/each}

<p class:on={cond && el.addEventListener('e', () => {})}>x</p>
<p style:color={el.addEventListener('f', () => {}) ? 'red' : 'blue'}>y</p>
<svelte:element this={el.addEventListener('g', () => {}) ? 'p' : 'span'}>z</svelte:element>
{#snippet card(target = el.addEventListener('h', () => {}))}
	<p>{target}</p>
{/snippet}
{@render card()}
