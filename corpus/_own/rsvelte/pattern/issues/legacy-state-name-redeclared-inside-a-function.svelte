<script>
	let v = { n: 1 };
	let w;

	function tick() {
		v = { n: v.n + 1 };
		w = v.n;
	}

	function go() {
		let v = { n: 0 };
		v.n = 2;
		let w;
		w = 3;
		return [v, w];
	}

	class C {
		m() {
			let v = { n: 0 };
			return v.n;
		}
	}
	const c = new C();
</script>

<button on:click={tick}>{v.n}{w}</button>
<button on:click={go}>go</button>
<button on:click={() => c.m()}>m</button>
