import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { id } = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(id)}`);
	}

	$$renderer.push(`<!--]-->`);
}