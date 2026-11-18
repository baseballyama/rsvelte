<script>
	let tag = $state('div');
	let n = $state(0);

	function log(node) {
		node.dataset.n = String(n);
		return () => {};
	}

	const attachments = [log, (node) => void node];
</script>

<svelte:element this={tag} {@attach log} data-x={n}>
	<svelte:element this={n > 0 ? 'b' : 'i'}>{n}</svelte:element>
</svelte:element>

<div {@attach attachments[0]} {@attach (node) => log(node)}>x</div>

{#each attachments as a, i}
	<span {@attach a}>{i}</span>
{/each}
