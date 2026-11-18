<script>
	let f = (n) => n;
</script>

<button
	on:click={() => f(1)}
	on:click={() => /* c */ f(1)}>1</button>
<button on:click={() => f( 1 )} on:click={() => f(1)}>2</button>
