/**
 * Default example code shown in the playground on initial load.
 */
export const DEFAULT_EXAMPLE = `<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>
	Clicked {count} {count === 1 ? 'time' : 'times'}
</button>

<style>
	button {
		padding: 0.5rem 1rem;
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}
	button:hover {
		background: #e55a2b;
	}
</style>`;
