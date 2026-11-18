<script>
	import Self from './component-bind-this-and-state.svelte';

	class Box {
		value = $state(0);
		get doubled() {
			return this.value * 2;
		}
	}

	let { depth = 1 } = $props();
	let box = $state(new Box());
	let el = $state(null);
	let inst = $state(null);
	let boxes = $state([new Box(), new Box()]);
</script>

<div bind:this={el}>{box.value} {box.doubled}</div>

{#each boxes as b, i}
	<input type="number" bind:value={boxes[i].value} />
{/each}

{#if depth > 0}
	<Self depth={depth - 1} bind:this={inst} />
{/if}

<p>{el?.tagName ?? '-'} {inst ? 'inst' : '-'} {boxes.map((b) => b.doubled).join(',')}</p>
