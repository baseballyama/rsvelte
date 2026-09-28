import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(animals);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let animal = each_array[i];

		$$renderer.push(`<p>${$.escape(i)}: ${$.escape(animal)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}