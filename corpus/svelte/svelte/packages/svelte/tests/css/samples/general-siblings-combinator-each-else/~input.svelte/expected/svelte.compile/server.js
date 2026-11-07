import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let array = [];

	$$renderer.push(`<div class="a svelte-dm7ine"></div> `);

	const each_array = $.ensure_array_like(array);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="b svelte-dm7ine"></div>`);
		}
	} else {
		$$renderer.push(`<!--[!--><div class="c svelte-dm7ine"></div>`);
	}

	$$renderer.push(`<!--]--> <div class="d svelte-dm7ine"></div>`);
}