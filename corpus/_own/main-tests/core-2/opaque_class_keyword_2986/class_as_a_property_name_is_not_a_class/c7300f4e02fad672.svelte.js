export function make() {
	const o = { class: 'a' };
	const flag = $derived(o.class !== '');
	return { read: () => flag };
}
