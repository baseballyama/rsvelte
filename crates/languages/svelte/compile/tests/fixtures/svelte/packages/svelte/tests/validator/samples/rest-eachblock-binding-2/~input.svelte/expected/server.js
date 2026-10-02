import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let objArray = [[1, 2, 3, "4"], [5, 6, 7, "8"]];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(objArray);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let [id, ...rest] = each_array[$$index];

		$$renderer.push(`<input${$.attr('value', rest[0])} type="text"${$.attr('placeholder', rest[2])}/> <br/>`);
	}

	$$renderer.push(`<!--]-->`);
}