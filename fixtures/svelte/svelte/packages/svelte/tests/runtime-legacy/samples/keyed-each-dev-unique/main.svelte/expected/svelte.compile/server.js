import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const array = [1, 2, 3, 1];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(item)}`);
	}

	$$renderer.push(`<!--]-->`);
}