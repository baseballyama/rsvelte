<script>
	// leading
	let n = $state(0); // trailing
	/* block */
	const f = /* inline */ (x) => x + 1; /* tail */
</script>

<!-- before element -->
<div
	class="a"
	data-x={n}
>
	{n}
	<!-- between children -->
	<span>{f(n)}</span>
</div>

{#if n}
	<!-- inside if -->
	<p>yes</p>
{:else}
	<!-- inside else -->
	<p>no</p>
{/if}

<!-- svelte-ignore a11y_missing_attribute -->
<a>no href</a>

<style>
	/* css comment */
	div {
		color: red; /* trailing css */
	}
</style>
