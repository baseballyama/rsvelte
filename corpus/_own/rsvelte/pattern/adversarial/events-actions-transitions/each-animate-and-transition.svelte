<script>
	import { flip } from 'svelte/animate';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let items = $state([{ id: 1 }, { id: 2 }]);
	let show = $state(true);
	let d = $state(200);
</script>

{#each items as item (item.id)}
	<div animate:flip={{ duration: d, easing: cubicOut }} transition:fade>{item.id}</div>
{/each}

{#if show}
	<p in:fly={{ y: 10 }} out:slide|local>in/out</p>
{/if}

{#each items as item, i (item.id)}
	<span animate:flip in:fade|global={{ duration: d }}>{i}</span>
{/each}

<button onclick={() => (show = !show)}>{show}</button>
