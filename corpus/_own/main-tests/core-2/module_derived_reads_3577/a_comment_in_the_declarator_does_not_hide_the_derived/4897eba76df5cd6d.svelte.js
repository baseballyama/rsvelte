let a = $state(1);
let v = /* a */ /* b */ $derived.by(() => a + 9);

export function read() {
	return `${v}`;
}
