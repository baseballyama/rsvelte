<script>
	let group = 'g';
	let click = () => {};
	let foo = (n) => {};
</script>

<input type="radio" bind:group={group} value="a" />
<button on:click={click}>b</button>
<div use:foo>c</div>
