import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let letters = ['a', 'b', 'c'];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(letters);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let letter = each_array[i];

		$$renderer.push(`<span>${$.escape(i)}: ${$.escape(letter)}</span>`);
	}

	$$renderer.push(`<!--]-->`);
}