<script>
	import Icon from './Icon.svelte';

	let items = $state(['a', 'b']);
	let selected = $state('a');
	let label = 'x';

	const select = (name) => {
		selected = name;
	};
</script>

{#each items as name (name)}
	<button onclick={() => select(name)}>{name}</button>
{/each}

<p>{label}</p>

{#if selected}
	{const name = $derived(selected)}
	{let count = $state(1)}
	{const label = $derived(name + '!')}
	<Icon {name} />
	<button onclick={() => count++}>{count} {label}</button>
{/if}

{#each items as count (count)}
	<span>{count}</span>
{/each}
