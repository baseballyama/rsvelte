import * as $ from 'svelte/internal/server';

export default function Checkbox_bind_group($$renderer) {
	let flavours = [];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(['cookies and cream', 'mint choc chip', 'raspberry ripple']);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let flavour = each_array[$$index];

		$$renderer.push(`<label><input type="checkbox" name="flavours"${$.attr('value', flavour)}${$.attr('checked', flavours.includes(flavour), true)}/> ${$.escape(flavour)}</label>`);
	}

	$$renderer.push(`<!--]-->`);
}