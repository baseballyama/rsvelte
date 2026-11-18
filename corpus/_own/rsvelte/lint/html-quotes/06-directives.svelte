<script>
	let value = '';
	let color = 'red';
	let active = true;
	const act = () => {};
	const handler = () => {};
</script>

<input bind:value="{value}" />
<button on:click="{handler}">b</button>
<div style:color="{color}">c</div>
<div class:active>shorthand skipped</div>
<div use:act>no value skipped</div>
<input bind:value />
