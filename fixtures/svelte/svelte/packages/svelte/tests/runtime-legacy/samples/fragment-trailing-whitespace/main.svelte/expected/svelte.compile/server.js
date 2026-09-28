import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let message = "the quick brown fox jumps over the lazy dog";

	$$renderer.push(`<div id="first"><!--[-->`);

	const each_array = $.ensure_array_like(message);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let char = each_array[$$index];

		$$renderer.push(`<span>${$.escape(char)}</span>`);
	}

	$$renderer.push(`<!--]--></div> <div id="second"><!--[-->`);

	const each_array_1 = $.ensure_array_like(message);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let char = each_array_1[$$index_1];

		$$renderer.push(`<span>${$.escape(char)}</span>`);
	}

	$$renderer.push(`<!--]--></div>`);
}