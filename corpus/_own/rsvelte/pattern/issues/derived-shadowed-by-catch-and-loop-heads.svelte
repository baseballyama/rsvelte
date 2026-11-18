<script>
	import { writable } from 'svelte/store';

	let base = $state({ n: 1 });
	let v = $derived(base);
	let list = $derived([base]);
	const y = writable(1);

	function shadowed(rows) {
		try {
			throw { n: 0 };
		} catch (v) {
			v.n = 2;
			v.n++;
		}
		for (const v of rows) {
			v.n = 3;
		}
		for (const list in rows) {
			console.log(list);
		}
		for (let v = 0; v < 2; v++) {
			console.log(v);
		}
		try {
			throw 0;
		} catch ($y) {
			console.log($y);
		}
	}

	function unshadowed(rows) {
		try {
			throw 0;
		} catch (e) {
			console.log(v.n, e);
		}
		for (const row of list) {
			console.log(row, list.length, $y);
		}
		for (let i = v.n; i < v.n + 1; i++) {
			console.log(i, $y);
		}
		for (const k in rows) {
			console.log(k, v.n);
		}
	}
</script>

<button onclick={() => shadowed([])}>shadowed</button>
<button onclick={() => unshadowed({})}>unshadowed</button>
{v.n}
{list.length}
{$y}
