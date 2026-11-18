<script>
	import { writable } from 'svelte/store';

	const obj = writable({ label: 'x' });
	const flag = writable(false);
	const rows = [1];
</script>

<!-- raw operand + destructurable prop read + discarded unsubscribe, in one file -->
<p>{$obj.label}</p>
<p>{obj + 1}</p>
{#if flag}on{/if}

{#each rows as flag}
	<p>{flag + 1}</p>
	<p>{$obj.label}</p>
{/each}

<button
	onclick={() => {
		obj.subscribe();
	}}>go</button
>
