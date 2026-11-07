export function createCounterDouble() {
  let count = $state(0);
  const doubled = $derived(count * 2);

	function increment() {
		count += 1;
	}

	return {
		get doubled() {
			return doubled;
		},
		increment
	};
}