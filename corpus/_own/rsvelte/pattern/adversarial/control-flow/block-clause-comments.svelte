<script>
	let x = $state(true);
	let items = $state([]);
</script>

{#if x}
	<!-- inside consequent -->
{:else}
	<!-- inside alternate -->
	<b>b</b>
{/if}

{#each items as item}
	{item}
{:else}
	<!-- empty case -->
	none
{/each}

{#if { a: 1 }.a}
	<i>object literal condition</i>
{/if}

{#if x}<span>tight</span>{:else}<span>packed</span>{/if}
