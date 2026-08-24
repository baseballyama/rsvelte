<script>
	let log = $state([]);

	class Counter {
		#a = $state();
		#b = $state({ val: -1 });
		#c = $state(0);

		constructor() {
			// constructor reads go through `.v`, method reads through `$.get`
			this.#a ||= { val: 0 };
			this.#b &&= { val: 0 };
			this.#c ??= 1;
		}

		bump() {
			// a non-proxyable right-hand side must not get the proxy flag
			this.#c ??= 2;
			this.#a ||= { val: 1 };
			// a logical assignment in expression position, where the value is used
			const seen = (this.#b &&= { val: 2 });
			// and one whose parent binds tighter than the logical operator
			log = [...log, !(this.#a ||= { val: 3 }), seen];
		}

		get a() { return this.#a?.val; }
		get b() { return this.#b?.val; }
		get c() { return this.#c; }
	}

	const counter = new Counter();
</script>

<button onclick={() => counter.bump()}>bump</button>
<p>{counter.a} {counter.b} {counter.c} {log.length}</p>
