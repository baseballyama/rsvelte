<script>
	import A from './A.svelte';
	import B from './B.svelte';

	let flag = $state(true);
	const chosen = $derived(flag ? A : B);
	const table = { A, B };
	let key = $state('A');
</script>

<svelte:component this={chosen} />
<svelte:component this={table[key]} />
<svelte:component this={flag ? A : B} count={1} />

{#if flag}
	{@const Held = chosen}
	<Held />
{/if}

<button onclick={() => (flag = !flag)}>{key}</button>
