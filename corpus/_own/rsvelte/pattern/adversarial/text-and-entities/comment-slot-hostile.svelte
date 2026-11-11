<!-- leading document comment -->
<script>
	// leading line comment
	/* block */
	let n = $state(0); // trailing
	/**
	 * jsdoc
	 * @type {number}
	 */
	let m = $state(1);
	// trailing script comment
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div onclick={() => n++}>
	<!-- inner comment -->
	{n}
	<!-- comment with {braces} and <tags> -->
</div>

{#if n > 0}
	<!-- inside if -->
	<p>{m}</p>
{/if}

<style>
	/* css comment with } brace */
	div {
		color: red;
	}
</style>
