<script>
	class Counter {
		count = $state(0);
		#priv = $state.raw({ a: 1 });
		doubled = $derived(this.count * 2);
		tripled = $derived.by(() => this.count * 3);
		static s = 1;
		plain = 2;
		constructor(x) {
			this.later = $state(x);
			this.#other = $state([]);
		}
		#other;
		inc() { this.count++; this.#priv = { a: 2 }; this.#other.push(1); }
		get p() { return this.#priv.a; }
	}
	const c = new Counter(1);
	let obj = { k: class { v = $state(1); } };
</script>
<button onclick={() => c.inc()}>{c.count} {c.doubled} {c.p}</button>
