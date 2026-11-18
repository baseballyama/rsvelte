<script>
	const code = "const fake = 'oops';";
	// const fake2 = 'nope';
	const real = 'yes';
	function use() {
		return code;
	}
</script>

<button on:click={fake}>1</button>
<button on:click={fake2}>2</button>
<button on:click={real}>3</button>
<span>{use()}</span>
