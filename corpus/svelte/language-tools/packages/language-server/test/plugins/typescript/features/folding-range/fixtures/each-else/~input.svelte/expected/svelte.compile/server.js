import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const each_array = $.ensure_array_like(items);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(item)}`);
		}
	} else {
		$$renderer.push(`<!--[!--><!---->no items`);
	}

	$$renderer.push(`<!--]-->`);
}