import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const values = ['x', 'y', 'z'];
	const list = { a: [], b: [], c: [] };

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(Object.keys(list));

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let key = each_array[$$index_1];

		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(values);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let value = each_array_1[$$index];

			$$renderer.push(`<label><input type="checkbox"${$.attr('checked', list[key].includes(value), true)}${$.attr('value', value)}/> ${$.escape(value)}</label>`);
		}

		$$renderer.push(`<!--]--> <p>${$.escape(list[key].join(', '))}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}