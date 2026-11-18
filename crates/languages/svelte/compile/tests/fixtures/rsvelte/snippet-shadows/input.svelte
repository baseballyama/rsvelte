<script>
	import List from './List.svelte';
	let { item, label } = $props();
	let count = $state(0);
	let items = $state([1]);
</script>
{#if label}
	<div>{#snippet item()}<b>snippet</b>{/snippet}{@render item()}</div>
	<p>{#snippet count()}x{/snippet}{@render count()}</p>
{/if}
<button onclick={() => count++}>{count}</button>
{#each items as row}
	<div>{#snippet row()}r{/snippet}{#if label}{@render row()}{/if}<i title={String(row)}></i></div>
{/each}
<List>{#snippet label()}{@render label?.()}{/snippet}</List>
