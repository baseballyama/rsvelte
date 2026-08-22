<script>
	const KEY = Symbol('k');

	class Base {
		hits = $state(0);
		bump() {
			this.hits += 1;
		}
	}

	class Derived extends Base {
		extra = $state({ [KEY]: 1, nested: { deep: [1, 2] } });
		get total() {
			return this.hits + this.extra.nested.deep.length;
		}
		set total(v) {
			this.hits = v;
		}
	}

	let d = $state(new Derived());
	let frozen = $state(Object.freeze({ a: 1 }));
	let raw = $state.raw(new Map([['a', 1]]));
	let snap = $derived($state.snapshot(d.extra));
</script>

<button onclick={() => d.bump()}>{d.total}</button>
<p>{frozen.a} {raw.get('a')} {snap.nested.deep.join('')}</p>
