import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const each_array = $.ensure_array_like(animals);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let animal = each_array[$$index];

			$$renderer.push(`<p>${$.escape(animal)}</p>`);
		}
	} else {
		$$renderer.push(`<!--[!--><p>no animals</p>`);
	}

	$$renderer.push(`<!--]-->`);
}