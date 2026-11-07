import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function flip() {}

	$$renderer.push(`<div><!--[-->`);

	const each_array = $.ensure_array_like([]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let n = each_array[$$index];
		const a = n;

		$$renderer.push(`<div></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}