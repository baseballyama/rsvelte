<script>
	let raw = $state('<b>bold</b>');
	const parts = ['<i>', 'x', '</i>'];
</script>

<div>{@html raw}</div>
<div>{@html parts.join('')}</div>
<div>{@html `<u>${raw}</u>`}</div>
<div>{@html raw ?? ''}</div>
{#if raw}<span>{@html raw}</span>{/if}
{#each parts as part}<em>{@html part}</em>{/each}
<button onclick={() => (raw += '!')}>{raw.length}</button>
