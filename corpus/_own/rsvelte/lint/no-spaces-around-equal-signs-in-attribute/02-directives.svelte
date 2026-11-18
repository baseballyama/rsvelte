<script>
	let v = '';
	let color = 'red';
	let active = true;
	const act = () => {};
	const h = () => {};
</script>

<input bind:value = {v} />
<button on:click ={h}>b</button>
<div style:color= {color}>c</div>
<div use:act = {1}>d</div>
<div class:active>shorthand ok</div>
<input bind:value />
