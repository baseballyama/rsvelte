import * as $ from 'svelte/internal/server';

export default function Invalid_svelte_ignore02_svelte4_input($$renderer) {
	$$renderer.push(`<div>`);

	const each_array = $.ensure_array_like([]);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let e = each_array[$$index];

			$$renderer.push(`<!---->A`);
		}
	} else {
		$$renderer.push(`<!--[!--><label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	}

	$$renderer.push(`<!--]--></div>`);
}