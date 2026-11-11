<svelte:options runes />

<script>
	function f($$props) {
		return $$props;
	}
</script>

<b>{f(1)}</b>
{#each [1] as $$props}{$$props}{/each}
{#snippet s($$props)}{$$props}{/snippet}
{@render s(2)}
