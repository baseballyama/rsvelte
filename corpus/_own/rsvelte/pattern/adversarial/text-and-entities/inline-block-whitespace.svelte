<script>
	let x = $state(true);
	let word = $state('ld');
</script>

<p>wor{#if x}{word}{/if}s</p>
<p>
	a {#if x}b{/if}
	c
</p>
<p><b>a</b><i>b</i> <u>c</u></p>
<p>{x}<br />{word}</p>
<span>a</span>
{#if x}
	<span>b</span>
{/if}
<span>c</span>
