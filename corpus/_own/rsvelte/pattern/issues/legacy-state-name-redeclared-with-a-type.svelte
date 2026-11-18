<script lang="ts">
	let v: { n: number } = { n: 1 };

	function tick() {
		v = { n: v.n + 1 };
	}

	function go() {
		let v: { n: number } = { n: 0 };
		return v.n;
	}
</script>

<button on:click={tick}>{v.n}</button>
<button on:click={go}>go</button>
