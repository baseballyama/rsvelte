<script>
	let raw = $state('<b>bold</b>');
	const quoted = `<a href="x?a=1&b=2" title='q'>link</a>`;
</script>

<div>{@html raw}</div>
<div>{@html quoted}</div>
<div>{@html '<script>' + 'alert(1)' + '</' + 'script>'}</div>
<div>{@html `<p>${raw}</p>`}</div>
<div>{@html raw ?? ''}</div>
{#if raw}
	<span>{@html raw.toUpperCase()}</span>
{/if}
