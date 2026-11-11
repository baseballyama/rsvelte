<script>
	class Counter {
		#count = $state(0);
		total = $state(0);
		doubled = $derived(this.#count * 2);
		static instances = 0;

		constructor() {
			Counter.instances++;
			$effect(() => {
				this.total = this.#count;
			});
		}

		get count() {
			return this.#count;
		}

		set count(value) {
			this.#count = value;
		}

		bump = () => {
			this.#count++;
		};
	}

	const c = new Counter();
	const snapshot = $derived.by(() => $state.snapshot({ n: c.count }));
	let raw = $state.raw({ deep: { value: 1 } });
	const id = $props.id();

	$effect.pre(() => {
		void c.doubled;
	});
</script>

<button onclick={c.bump}>{c.count} / {c.doubled} / {c.total}</button>
<p>{Counter.instances} {snapshot.n} {raw.deep.value} {id}</p>
