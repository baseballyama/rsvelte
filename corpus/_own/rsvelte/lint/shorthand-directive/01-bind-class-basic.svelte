<script>
	let value = 'v';
	let other = 'o';
	let active = true;
	let isActive = false;
	let checked = true;
</script>

<input bind:value={value} />
<input bind:value={other} />
<div class:active={active}>a</div>
<div class:active={isActive}>b</div>
<input type="checkbox" bind:checked />
