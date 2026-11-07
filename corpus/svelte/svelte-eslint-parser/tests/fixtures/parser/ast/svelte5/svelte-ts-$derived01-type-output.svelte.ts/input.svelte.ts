export function createCounterDouble() { // createCounterDouble: () => { readonly doubled: number; increment: () => void; }
  let count = $state(0); // count: number, $state(0): 0
  const doubled = $derived(count * 2); // doubled: number, $derived(count * 2): number

	function increment() { // increment: () => void
		count += 1; // count: number
	}

	return {
		get doubled() { // doubled: number
			return doubled; // doubled: number
		},
		increment // increment: () => void, increment: () => void
	};
}