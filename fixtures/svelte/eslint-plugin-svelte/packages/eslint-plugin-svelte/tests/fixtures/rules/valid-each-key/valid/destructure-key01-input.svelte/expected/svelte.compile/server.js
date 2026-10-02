import * as $ from 'svelte/internal/server';

export default function Destructure_key01_input($$renderer) {
	let things = [
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'carrot' },
		{ id: 4, name: 'doughnut' },
		{ id: 5, name: 'egg' }
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(things);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { id, name } = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(name)}`);
	}

	$$renderer.push(`<!--]-->`);
}