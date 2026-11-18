<script>
	let x = $state(1);
</script>

<svelte:head>
	<title>{`a${x}`}</title>
</svelte:head>
<button onclick={() => x++}>go</button>
