<script>
	import { writable } from 'svelte/store';
	const items = writable([]);
</script>
{#each $items as { name, icon = 1 }, i (name)}
	<p>{name}{icon}{i}</p>
{/each}
{#each $items as [a, b]}
	<button onclick={() => { a.x = 1; }}>{a}{b}</button>
{/each}
{#each $items as { c }}
	<input bind:value={c.v} />
{/each}
