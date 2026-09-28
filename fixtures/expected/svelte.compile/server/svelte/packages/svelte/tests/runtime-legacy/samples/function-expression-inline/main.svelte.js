import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let list = [1, 2, 3];

	$$renderer.push(`<button>click me</button> <!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let number = each_array[$$index];

		$$renderer.push(`<p>${$.escape(number)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}