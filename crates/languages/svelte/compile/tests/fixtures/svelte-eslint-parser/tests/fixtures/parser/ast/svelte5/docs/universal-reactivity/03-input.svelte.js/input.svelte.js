export function createCounter() {
	let count = $state(0);

	function increment() {
		count += 1;
	}

	return {
		get count() {
			return count;
		},
		increment
	};
}