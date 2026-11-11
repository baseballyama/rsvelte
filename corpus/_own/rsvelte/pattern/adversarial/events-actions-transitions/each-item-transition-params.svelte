<script>
	import { fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let cards = $state([
		{ id: 1, delay: 0 },
		{ id: 2, delay: 100 },
	]);
</script>

{#each cards as card, i (card.id)}
	<div
		in:fly={{ y: 20, delay: card.delay + i * 50, easing: cubicOut }}
		out:scale={{ start: i === 0 ? 0.5 : 0.9 }}
	>
		{card.id}
	</div>
{/each}

{#each Object.entries({ a: { id: 1 }, b: { id: 2 } }) as [name, meta] (meta.id)}
	<span>{name}:{meta.id}</span>
{/each}
