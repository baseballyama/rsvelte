export function createCounter() { // createCounter: () => { readonly count: number; increment: () => void; }
	let count = $state(0); // count: number, $state(0): 0

	function increment() { // increment: () => void
		count += 1; // count: number
	}

	return {
		get count() { // count: number
			return count; // count: number
		},
		increment // increment: () => void, increment: () => void
	};
}
