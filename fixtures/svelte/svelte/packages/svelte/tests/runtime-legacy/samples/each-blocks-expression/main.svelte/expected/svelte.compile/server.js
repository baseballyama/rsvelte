import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(['a', 'b', 'c']);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let letter = each_array[$$index];

		$$renderer.push(`<p>${$.escape(letter)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}