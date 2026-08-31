<script>
	export let prop = { n: 1 };
	let base = 1;
	$: derived = { n: base };

	function go(src) {
		const { a: prop } = src;
		prop.n = 2;
		prop.n++;
		for (const { b: derived } of src.list) {
			derived.n = 3;
		}
		try {
			throw src;
		} catch (prop) {
			prop.n = 4;
		}
	}

	function unshadowed() {
		prop.n = 5;
		derived.n = 6;
	}
</script>

<button on:click={() => go({ a: { n: 0 }, list: [{ b: { n: 0 } }] })}>{prop.n}</button>
<button
	on:click={() => {
		const { a: prop } = { a: { n: 0 } };
		prop.n = 7;
		for (const { b: derived } of [{ b: { n: 0 } }]) {
			derived.n = 9;
		}
		try {
			throw 1;
		} catch (derived) {
			derived.n = 8;
		}
	}}>{derived.n}</button>
<button on:click={unshadowed}>go</button>
