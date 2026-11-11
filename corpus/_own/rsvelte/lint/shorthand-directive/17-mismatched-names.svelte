<script>
	let value = 'v';
	let other = 'o';
	let active = true;
	let inactive = false;
	let color = 'red';
	let colour = 'red';
</script>

<input bind:value={other} />
<div class:active={inactive}>a</div>
<div style:color={colour}>b</div>
<div class:active={active.valueOf()}>c</div>
<div style:color={color + ''}>d</div>
<span>{value}{colour}</span>
