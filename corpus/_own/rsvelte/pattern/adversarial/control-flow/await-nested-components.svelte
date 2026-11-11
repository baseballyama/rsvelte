<script>
	import Spinner from './Spinner.svelte';

	let outer = $state(Promise.resolve([1, 2]));
	let inner = $state(Promise.resolve('deep'));
</script>

{#await outer}
	<Spinner size="lg" />
{:then list}
	{#each list as n (n)}
		{#await inner then word}
			<p>{n}:{word}</p>
		{:catch e}
			<Spinner error={e} />
		{/await}
	{/each}
{:catch outerErr}
	{#await Promise.reject(outerErr) catch again}
		<p>{again.message}</p>
	{/await}
{/await}
