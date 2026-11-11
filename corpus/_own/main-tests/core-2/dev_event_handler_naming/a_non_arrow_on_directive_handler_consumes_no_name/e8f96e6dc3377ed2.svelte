<script>
	export let handler;
	let count = 0;
</script>
<button on:click={handler}>a</button>
<button on:click={() => count++}>b</button>
