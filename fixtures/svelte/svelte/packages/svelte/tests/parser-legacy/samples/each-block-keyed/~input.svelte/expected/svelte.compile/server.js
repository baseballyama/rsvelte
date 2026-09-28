import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(todos);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let todo = each_array[$$index];

		$$renderer.push(`<p>${$.escape(todo)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}