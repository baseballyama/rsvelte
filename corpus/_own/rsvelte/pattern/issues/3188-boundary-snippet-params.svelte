<script>
	let o = $state(1);
	let d = $derived(o * 2);
</script>

<svelte:boundary>
	<b>{o}</b>
	{#snippet failed({ message }, reset)}
		<i>{message}</i>
		<button onclick={reset}>r</button>
	{/snippet}
	{#snippet pending()}<u>{d}</u>{/snippet}
</svelte:boundary>

<svelte:boundary>
	<b>{d}</b>
	{#snippet failed(o)}<s>{o}</s>{/snippet}
</svelte:boundary>
