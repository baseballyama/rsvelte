<script>
	class Counter {
		#a = $state();
		#b = $state({ val: -1 });
		constructor() {
			this.#a ||= { val: 0 };
			this.#b.val += 1;
			this.sum = $derived(this.#a.val + this.#b.val);
			this.copy = $state(this.#b);
			this.later = () => this.#a;
			function nested(self) {
				return self.#b;
			}
			nested(this);
		}
		inc() {
			this.#a.val += 1;
		}
	}

	let counter = new Counter();
</script>

<button onclick={() => counter.inc()}>{counter.sum}</button>
