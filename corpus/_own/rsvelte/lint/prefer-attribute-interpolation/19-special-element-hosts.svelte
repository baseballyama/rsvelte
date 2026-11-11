<script>
	let b = 2;
</script>

<svelte:window data-x={`v${b}`} />
<svelte:document data-x={`v${b}`} />
<svelte:body data-x={`v${b}`} />
<svelte:head>
	<meta name="x" content={`v${b}`} />
</svelte:head>
<svelte:boundary onerror={() => {}}>
	<p data-x={`v${b}`}>1</p>
</svelte:boundary>
