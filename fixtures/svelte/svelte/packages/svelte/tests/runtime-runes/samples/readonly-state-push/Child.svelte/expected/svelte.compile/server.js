import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { array } = $$props;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let number = each_array[$$index];

		$$renderer.push(`<p>${$.escape(number)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}