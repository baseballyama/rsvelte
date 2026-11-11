<script>
	class Counter {
		#hidden = $state(1);
		count = $state(0);
		doubled = $derived(this.count * 2 + this.#hidden);
		static origin = 'static';
		bump() {
			this.count += 1;
			this.#hidden -= 1;
		}
		get sum() {
			return this.count + this.#hidden;
		}
	}
	const c = new Counter();
</script>

<button onclick={() => c.bump()}>{c.doubled} {c.sum} {Counter.origin}</button>
