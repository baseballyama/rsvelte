<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	const s = writable(0);
	const rows = [1];
	const p = Promise.resolve(1);
	function act() {
		return {};
	}
	let bound;
</script>

<div {...s}></div>
<div use:act={s}></div>
<div style:color={s}></div>
<div class:on={s}></div>
<div title={s}></div>
<div bind:this={bound}>{s}</div>
<svelte:element this={s ? 'p' : 'span'}>x</svelte:element>
{#each rows as row (s)}
	<p>{row}</p>
{/each}
{#each s as row}
	<p>{row}</p>
{/each}
{#await s then v}
	<p>{v}</p>
{/await}
{#await p then v}
	{@const combined = s + v}
	<p>{combined}</p>
{/await}
{#snippet card(fallback = s)}
	<p>{fallback}</p>
{/snippet}
{@render card()}
<Child prop={s} {s} />
<p>{@html s}</p>
{@debug s}
