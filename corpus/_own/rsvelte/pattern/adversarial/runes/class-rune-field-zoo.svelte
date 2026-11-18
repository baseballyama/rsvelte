<script>
	class Zoo {
		plain = $state(0);
		raw = $state.raw({ a: 1 });
		derived = $derived(this.plain * 2);
		byDerived = $derived.by(() => this.plain + 1);
		#priv = $state('p');
		'quoted key' = $state('q');
		static staticPlain = 1;

		get priv() {
			return this.#priv;
		}

		set priv(v) {
			this.#priv = v;
		}

		constructor(seed) {
			this.plain = seed;
		}

		bump() {
			this.plain += 1;
			this.raw = { a: this.raw.a + 1 };
			this.#priv += '!';
		}
	}

	class WithCtorState {
		constructor() {
			this.inCtor = $state(0);
		}
		bump() {
			this.inCtor += 1;
		}
	}

	const z = new Zoo(1);
	const w = new WithCtorState();
</script>

<button onclick={() => { z.bump(); w.bump(); }}>
	{z.plain}{z.raw.a}{z.derived}{z.byDerived}{z.priv}{z['quoted key']}{Zoo.staticPlain}{w.inCtor}
</button>
