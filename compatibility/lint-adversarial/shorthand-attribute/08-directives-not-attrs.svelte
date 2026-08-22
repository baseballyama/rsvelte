<script>
	let value = 'v';
	let active = true;
</script>

<input bind:value={value} />
<div class:active={active}>a</div>
<button on:click={() => value}>b</button>
