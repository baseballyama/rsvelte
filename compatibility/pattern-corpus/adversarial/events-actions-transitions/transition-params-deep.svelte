<script>
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	let items = $state([{ id: 1 }, { id: 2 }]);
	let on = $state(true);
</script>

{#if on}
	<p transition:fade={{ duration: 200, easing: quintOut }}>t</p>
	<p in:fly|global={{ y: 20 }} out:fade|local>io</p>
{/if}
{#each items as item (item.id)}
	<div animate:flip={{ duration: 300 }}>{item.id}</div>
{/each}
<button onclick={() => { on = !on; items = [...items].reverse(); }}>go</button>
