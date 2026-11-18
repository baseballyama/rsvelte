<script>
	function f() {}
	function g() {}
	let cond = false;
	const picked = cond ? f : g;
</script>

<button onclick={f}>1</button>
<button
	onclick={() => {
		cond = !cond;
	}}>2</button
>
<button onclick={cond ? f : g}>3</button>
<button onclick={picked}>4</button>
<button onclick={null}>5</button>
<button onclick={undefined}>6</button>
<button onclick={f.bind(null)}>7</button>
