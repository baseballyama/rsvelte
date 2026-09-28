import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [
		{ name: 'A', selected: true },
		{ name: 'B', selected: false },
		{ name: 'C', selected: false }
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		const toggle = () => item.selected = !item.selected;

		$$renderer.push(`<div>${$.escape(item.selected ? '[Y]' : '[N]')}
		${$.escape(item.name)} <button>Toggle</button></div>`);
	}

	$$renderer.push(`<!--]-->`);
}