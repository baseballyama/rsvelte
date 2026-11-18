<script>
	let value = $state(1);
	let other = $state('x');
</script>

<div contenteditable="true" bind:innerText={value}>{value}</div>
<div contenteditable bind:innerHTML={other}>
	{#snippet raw()}<p>{value} and {other}</p>{/snippet}
	{@render raw()}
	<span>{other}</span>
</div>
<div contenteditable="plaintext-only" bind:textContent={other}>{other}</div>
<p>{value}</p>
