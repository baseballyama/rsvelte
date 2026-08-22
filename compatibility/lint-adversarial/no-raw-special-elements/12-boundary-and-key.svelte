<script>
	let k = 1;
</script>

<svelte:boundary>
	<body></body>
</svelte:boundary>
{#key k}
	<element></element>
{/key}
