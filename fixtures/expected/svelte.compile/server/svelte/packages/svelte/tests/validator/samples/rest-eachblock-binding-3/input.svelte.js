import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let objArray = [
		{ bar: { foo: '1', id: 0, innerValue: "test" } },
		{ bar: { foo: '2', id: 1, innerValue: "Somethin" } }
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(objArray);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { bar: { id, ...rest } } = each_array[$$index];

		$$renderer.push(`<input${$.attr('value', rest.innerValue)} type="text"${$.attr('placeholder', rest.foo)}/> <br/>`);
	}

	$$renderer.push(`<!--]-->`);
}