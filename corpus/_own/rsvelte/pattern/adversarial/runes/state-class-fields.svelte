<script>
	class Box {
		width = $state(1);
		height = $state(2);
		#secret = $state('s');
		area = $derived(this.width * this.height);
		label = $derived.by(() => `${this.area}${this.#secret}`);

		constructor(w) {
			this.width = w;
		}

		grow = () => {
			this.width += 1;
		};

		reveal() {
			return this.#secret;
		}
	}

	const box = new Box(3);

	class Plain {
		untracked = 0;
	}

	const plain = new Plain();
</script>

<button onclick={box.grow}>{box.label}:{box.reveal()}:{plain.untracked}</button>
