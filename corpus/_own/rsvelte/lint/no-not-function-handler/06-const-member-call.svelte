<script>
	const fromObj = { m() {} }.m;
	const fromArr = [() => 1][0];
	const tested = /re/.test('a');
	const viaCall = `t`.at(0);
</script>

<button onclick={fromObj}>1</button>
<button onclick={fromArr}>2</button>
<button onclick={tested}>3</button>
<button onclick={viaCall}>4</button>
