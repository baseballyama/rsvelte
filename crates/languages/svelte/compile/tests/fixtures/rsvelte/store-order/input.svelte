<script>
	import { writable } from 'svelte/store';
	const a = writable(1);
	const b = writable(2);
	const c = writable(3);
	const tag = writable('div');
	const xs = writable([]);
	const action = writable(() => {});
</script>
<svelte:element this={$tag}>{$a}</svelte:element>
{#each $xs as x}{x}{:else}{$c}{/each}
<p use:$action>{$b}</p>
{#snippet s()}{$a}{/snippet}
{@render s()}
