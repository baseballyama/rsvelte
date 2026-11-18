<script>
	let n = $state(0);
</script>

<svelte:element this={n > 0 ? 'p' : 'span'}>{n}</svelte:element>
<svelte:element this={n >= 0 && n < 2 ? 'em' : 'i'} data-n={n}>{n}</svelte:element>
<button onclick={() => n++}>+</button>
