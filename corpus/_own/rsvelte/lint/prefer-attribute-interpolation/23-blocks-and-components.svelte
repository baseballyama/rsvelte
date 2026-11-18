<script>
	import C from './01-basic.svelte';
	let b = 2;
	let rows = [1, 2];
</script>

{#each rows as row}
	<div data-x={`r${row}`}>1</div>
{/each}

{#snippet cell(v)}
	<div data-x={`c${v}`}>2</div>
{/snippet}

<C attr={`v${b}`} data-y={`w${b}`} />
{@render cell(b)}
