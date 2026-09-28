import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like([1, 2, 3, 4, 5]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let func = each_array[$$index];

			$$renderer.push(`<p>${$.escape((() => func)())}</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}