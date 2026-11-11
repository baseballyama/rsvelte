<script>
	let a = $state(1);
	let b = $state(2);
	let obj = $state({ id: 'k' });
</script>

{#key a}
	<p>simple</p>
{/key}

{#key (a, b)}
	<p>sequence</p>
{/key}

{#key obj.id}
	<p>member</p>
{/key}

{#key a + b * 2}
	{#key `${a}`}
		<p>nested</p>
	{/key}
{/key}
