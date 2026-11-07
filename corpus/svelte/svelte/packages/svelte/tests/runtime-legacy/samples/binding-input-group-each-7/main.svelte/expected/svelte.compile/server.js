import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const list = [
		{ id: 'x', data: [{ id: 1, data: [] }, { id: 2, data: [] }] },
		{ id: 'y', data: [{ id: 1, data: [] }, { id: 2, data: [] }] },
		{ id: 'z', data: [{ id: 1, data: [] }, { id: 2, data: [] }] }
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let { id, data } = each_array[$$index_1];

		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(data);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let item = each_array_1[$$index];

			$$renderer.push(`<input type="checkbox"${$.attr('checked', item.data.includes('a'), true)} value="a"${$.attr('data-index', `${$.stringify(id)}-${$.stringify(item.id)}`)}/> <input type="checkbox"${$.attr('checked', item.data.includes('b'), true)} value="b"${$.attr('data-index', `${$.stringify(id)}-${$.stringify(item.id)}`)}/> <input type="checkbox"${$.attr('checked', item.data.includes('c'), true)} value="c"${$.attr('data-index', `${$.stringify(id)}-${$.stringify(item.id)}`)}/>`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}