<script>
	class Box {
		value = // state
			$state(1);
		raw = // raw
			$state.raw(2);
		doubled = // derived
			$derived(this.value * 2);
		lazy = // derived by
			$derived.by(() => this.value + 1);
		#hidden;

		constructor() {
			this.extra =
				$state(3);
			this.#hidden = // constructor
				$state(4);
		}

		read() {
			return this.#hidden;
		}
	}

	const box = new Box();
</script>

<b>{box.value} {box.raw} {box.doubled} {box.lazy} {box.extra} {box.read()}</b>
