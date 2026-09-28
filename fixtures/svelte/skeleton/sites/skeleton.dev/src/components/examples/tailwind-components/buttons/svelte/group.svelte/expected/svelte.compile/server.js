import * as $ from 'svelte/internal/server';

export default function Group($$renderer) {
	let active = 'january';
	const months = ['january', 'february', 'march'];

	$$renderer.push(`<nav class="btn-group preset-outlined-surface-200-800 flex-col md:flex-row"><!--[-->`);

	const each_array = $.ensure_array_like(months);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let month = each_array[$$index];

		$$renderer.push(`<button type="button"${$.attr_class(`btn capitalize ${month === active ? 'preset-filled' : 'preset-tonal'}`)}>${$.escape(month)}</button>`);
	}

	$$renderer.push(`<!--]--></nav>`);
}