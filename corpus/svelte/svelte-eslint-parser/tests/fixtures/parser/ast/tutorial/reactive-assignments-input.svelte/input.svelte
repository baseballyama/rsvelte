<script>
	let count = 0;

	function handleClick() {
		// event handler code goes here
        count += 1;
	}
</script>

<button on:click={handleClick}>
	Clicked {count} {count === 1 ? 'time' : 'times'}
</button>
