import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let items = each_array[$$index];

		$$renderer.push(`<!--[-->`);

		$.slot($$renderer, $$props, 'default', { a: items }, () => {
			$$renderer.push(`Hello`);
		});

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}