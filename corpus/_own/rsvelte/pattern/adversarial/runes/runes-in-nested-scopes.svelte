<script>
	let top = $state(0);

	function outer() {
		const inner = () => {
			top += 1;
		};
		return inner;
	}

	class Holder {
		v = $state(0);

		constructor() {
			this.v = 1;
		}

		bump = () => {
			this.v += 1;
			top += 1;
		};
	}

	const h = new Holder();

	const obj = {
		get value() {
			return top;
		},
		set value(v) {
			top = v;
		},
		method() {
			top += 1;
		},
	};

	for (let i = 0; i < 1; i++) {
		const shadow = top;
		void shadow;
	}

	try {
		top;
	} catch (top) {
		void top;
	}
</script>

<button onclick={() => { outer()(); h.bump(); obj.method(); }}>{top}{h.v}{obj.value}</button>
