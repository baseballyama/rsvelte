<script>
	let n = $state(1);
	let items = $state([1, 2]);
</script>
{#if n}
	{let [n] = $state([5])}
	<p>{n}</p>
	<button onclick={() => n++}>x</button>
{/if}
