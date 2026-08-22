<script>
	const message = 'hello!';
	const alias = message;
	const deep = alias;
</script>

<button on:click={deep}>x</button>
<button onclick={alias}>y</button>
