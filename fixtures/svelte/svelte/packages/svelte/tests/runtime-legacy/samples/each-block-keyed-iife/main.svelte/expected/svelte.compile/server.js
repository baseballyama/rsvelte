import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const arr = [1, 2, 3];

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(arr);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div>${$.escape(item)}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}