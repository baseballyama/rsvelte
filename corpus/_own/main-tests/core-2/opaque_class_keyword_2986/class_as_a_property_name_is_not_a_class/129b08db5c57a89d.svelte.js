export function make() {
	const o = { class() { return 1; } };
	const flag = $derived(o.class() !== 0);
	return { read: () => flag };
}
