import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like([1, 2]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let i = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(i)}`);
	}

	$$renderer.push(`<!--]-->`);
}