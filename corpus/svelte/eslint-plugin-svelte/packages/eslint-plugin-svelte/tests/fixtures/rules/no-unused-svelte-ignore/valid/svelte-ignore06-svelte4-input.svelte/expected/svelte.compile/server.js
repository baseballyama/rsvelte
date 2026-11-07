import * as $ from 'svelte/internal/server';

export default function Svelte_ignore06_svelte4_input($$renderer) {
	$$renderer.push(`<div><!--[-->`);

	const each_array = $.ensure_array_like([]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let e = each_array[$$index];

		$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	}

	$$renderer.push(`<!--]--></div> <div>`);

	const each_array_1 = $.ensure_array_like([]);

	if (each_array_1.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let e = each_array_1[$$index_1];

			$$renderer.push(`<!---->A`);
		}
	} else {
		$$renderer.push(`<!--[!--><div></div> <label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	}

	$$renderer.push(`<!--]--></div>`);
}