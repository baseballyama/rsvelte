<script>
	class K {
		'a b' = $state(1);
		#d = $derived(this['a b'] * 2);
		constructor() {
			this[true] = $state(1);
			this[null] = $state.raw(2);
			this[1n] = $state(3);
			this[0x10] = $state(4);
			this.e = $derived.by(() => this.#d + 1);
		}
		m() {
			let local = $state(0);
			local++;
			this.#d = 5;
			this.#d += 1;
			const Inner = class {
				#d = 1;
				read() {
					return this.#d;
				}
			};
			return [local, this.#d, new Inner()];
		}
	}
	new K();
</script>
