<script>
	const f = (v) => v;
</script>

<button type="button" on:click={() => f(`a\nb`)} on:click={() => f(`a
b`)}>x</button>
<button type="button" on:click={() => f(`a${ 1 }b`)} on:click={() => f(`a${1}b`)}>y</button>
