import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (true) {
		$$renderer.push('<!--[0-->');

		if (true) {
			$$renderer.push('<!--[0-->');
		} else if (true) {
			$$renderer.push('<!--[1-->');
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push(`<!--[-1--><!--[-->`);

		const each_array = $.ensure_array_like([]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let _ = each_array[$$index];
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}