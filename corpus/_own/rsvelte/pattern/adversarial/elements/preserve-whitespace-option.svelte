<svelte:options preserveWhitespace={true} />

<script>
	let x = $state('v');
</script>

<div>
	<span>a</span>
	<span>{x}</span>
</div>

<p>
	kept
	newlines
</p>
