import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (name == "world") {
		$$renderer.push(`<!--[0-->!`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--><!--[-->`);

	const each_array = $.ensure_array_like(x);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let y = each_array[$$index];

		$$renderer.push(`<!---->!`);
	}

	$$renderer.push(`<!--]-->`);

	$.await($$renderer, x, () => {}, (y) => {
		$$renderer.push(`!`);
	});

	$$renderer.push(`<!--]-->`);

	if (bla) {
		$$renderer.push(`<!--[0-->*`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}