<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	const rows = [1];
</script>

{#each rows as row}
	<button
		onclick={() => {
			s.subscribe();
		}}>{row}</button
	>
	<button onclick={() => s.subscribe()}>concise</button>
{/each}

{#snippet card()}
	<button
		onclick={() => {
			s.subscribe();
		}}>snippet</button
	>
{/snippet}

{@render card()}
