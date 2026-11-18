<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	const items = writable([]);
</script>

<button
	onclick={() => {
		$count++;
		$items = [...$items, $count];
		$items[0] = 0;
	}}
>
	{$count}
</button>

<input
	bind:value={() => String($count), (v) => count.set(Number(v) || 0)}
	onkeydown={(e) => e.key === 'Escape' && count.set(0)}
/>

{#each $items as it}
	<span>{it}</span>
{/each}
