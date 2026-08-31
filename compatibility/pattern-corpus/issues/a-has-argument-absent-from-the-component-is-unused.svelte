<script>
	import C from './C.svelte';
	async function load() {
		return 1;
	}
</script>

{#snippet body()}
	<i class="mark"></i>
{/snippet}

{#await load() then value}
	<div class="wc">
		<i class="mark"></i>
		{@render body()}
		<C />
	</div>
{/await}

<style>
	/* A render tag, a component and a non-exhaustive `{#await}` all make
	   the structural data incomplete, and rsvelte answered every one of these
	   `keep`. Upstream matches a `:has()` argument against the component's own
	   elements only, so a class no element here carries is unused whatever is
	   missing. */
	.wc:has(.absent) { color: red }
	.wc:has(> .absent) { color: red }
	.wc:has(+ .absent) { color: red }
	.wc:has(~ .absent) { color: red }

	/* Controls: the same four against a class that IS present, which a fix that
	   simply dropped the conservative bails would also report. */
	.wc:has(.mark) { color: red }
	.wc:has(> .mark) { color: red }
	.wc:has(i) { color: red }
	.wc:has(:focus-visible) { color: red }
</style>
