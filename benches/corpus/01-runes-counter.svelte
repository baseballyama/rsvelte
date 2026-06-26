<script>
	let count = $state(0);
	let step = $state(1);
	let doubled = $derived(count * 2);
	let parity = $derived(count % 2 === 0 ? 'even' : 'odd');

	$effect(() => {
		document.title = `Count: ${count}`;
	});

	function increment() {
		count += step;
	}

	function decrement() {
		count -= step;
	}

	function reset() {
		count = 0;
		step = 1;
	}
</script>

<div class="counter">
	<h1>Counter</h1>
	<p>Current: {count} ({parity})</p>
	<p>Doubled: {doubled}</p>

	<label>
		Step
		<input type="number" min="1" bind:value={step} />
	</label>

	<div class="buttons">
		<button onclick={decrement}>-</button>
		<button onclick={increment}>+</button>
		<button onclick={reset} disabled={count === 0}>Reset</button>
	</div>
</div>

<style>
	.counter {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: system-ui, sans-serif;
	}

	.buttons {
		display: flex;
		gap: 0.25rem;
	}

	button {
		padding: 0.25rem 0.75rem;
	}
</style>
