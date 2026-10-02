import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function cell($$renderer, v) {
		$$renderer.push(`<!---->Value: ${$.escape(v)}`);
	}

	$$renderer.push(`<table><tbody><tr><!--[-->`);

	const each_array = $.ensure_array_like([1, 2, 3]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let v = each_array[$$index];

		$$renderer.push(`<td>`);
		cell($$renderer, v);
		$$renderer.push(`<!----></td>`);
	}

	$$renderer.push(`<!--]--></tr></tbody></table>`);
}