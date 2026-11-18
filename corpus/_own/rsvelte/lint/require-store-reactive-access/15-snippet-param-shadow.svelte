<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
</script>

{#snippet card(s)}
	<p>{s + 1}</p>
{/snippet}

{#snippet plain(other)}
	<p>{s + other}</p>
{/snippet}

{@render card(1)}
{@render plain(2)}
