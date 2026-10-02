import * as $ from 'svelte/internal/server';

export default function _6_input($$renderer) {
	const each_array = $.ensure_array_like(todos);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let todo = each_array[$$index];

			$$renderer.push(`<p>${$.escape(todo.text)}</p>`);
		}
	} else {
		$$renderer.push(`<!--[!--><p>No tasks today!</p>`);
	}

	$$renderer.push(`<!--]-->`);
}