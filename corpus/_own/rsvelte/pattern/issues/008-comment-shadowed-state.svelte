<script>
	let count = $state(0);

	const multiplier = () => {
		let multiplier = $state(2);
		// } scanner payload
		let multiple = $derived(count * multiplier);

		return {
			get value() {
				return multiple;
			},
			increment() {
				multiplier++;
			}
		};
	};

	const values = multiplier();
</script>

<button onclick={values.increment}>increment</button>
<p>{values.value}</p>
