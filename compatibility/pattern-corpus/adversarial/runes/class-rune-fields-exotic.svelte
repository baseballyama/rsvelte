<script>
	class Counter {
		#n = $state(0);
		step = $state(1);
		doubled = $derived(this.#n * 2);
		summary = $derived.by(() => `${this.#n}/${this.doubled}`);
		history = $state.raw([]);

		constructor() {
			$effect.root(() => {
				$effect(() => {
					void this.doubled;
				});
				return () => {};
			});
		}

		get n() {
			return this.#n;
		}

		set n(v) {
			this.#n = v;
		}

		bump = () => {
			this.n += this.step;
		};

		static instances = 0;
		static {
			Counter.instances = 0;
		}
	}

	const c = new Counter();
	const obj = {
		inner: $derived(c.doubled + 1),
		method() {
			return c.summary;
		}
	};
</script>

<button onclick={c.bump}>{c.n} {c.doubled} {c.summary} {obj.inner} {obj.method()}</button>
<p>{Counter.instances} {c.history.length}</p>
