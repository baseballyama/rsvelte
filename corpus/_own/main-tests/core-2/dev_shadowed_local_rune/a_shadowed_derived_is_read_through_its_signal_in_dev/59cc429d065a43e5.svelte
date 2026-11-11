<script>
	let count = $state(0);
	const multiplier = () => {
		let multiplier = $state(2);
		let multiple = $derived(count * multiplier);

		return {
			get count() {
				return multiple;
			},
			inc: () => multiplier++
		};
	};
	const multiplied = multiplier();
</script>

<span>{multiplied.count}</span>
<button onclick={() => count++}>increase</button>
