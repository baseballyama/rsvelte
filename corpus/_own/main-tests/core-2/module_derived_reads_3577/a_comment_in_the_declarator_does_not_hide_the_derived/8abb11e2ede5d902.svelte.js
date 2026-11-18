let a = $state(1);
let v = /* k */ $derived.by(() => a + 9);

export function read() {
	return `${v}`;
}
