<script>
	let n = $state(2);
	let rows = $state([1, 2]);
</script>

{#each Array.from({ length: n }, (_, i) => i) as v}<b>{v}</b>{/each}
{#each rows.slice(0, 1) as row}<i>{row}</i>{/each}
{#each rows as rows}<u>{rows}</u>{/each}
<button onclick={() => n++}>{n}</button>
