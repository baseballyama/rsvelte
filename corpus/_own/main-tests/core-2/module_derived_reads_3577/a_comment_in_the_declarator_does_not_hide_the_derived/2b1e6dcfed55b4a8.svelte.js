let a = $state(1);
let v = /**/ $derived.by(() => a + 9);

export function read() {
	return `${v}`;
}
