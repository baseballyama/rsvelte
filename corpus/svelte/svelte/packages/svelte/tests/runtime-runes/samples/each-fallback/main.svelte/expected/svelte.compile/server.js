import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let data = { a: 1, b: 2, c: 3 };
	let filter = false;

	function toggle_filter() {
		if (filter) {
			filter = false;
			data = { a: 1, b: 2, c: 3 };
		} else {
			filter = true;
			data = {};
		}
	}

	$$renderer.push(`<div>`);

	const each_array = $.ensure_array_like(Object.keys(data));

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let key = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(key)}`);
		}
	} else {
		$$renderer.push(`<!--[!--><!---->Fallback`);
	}

	$$renderer.push(`<!--]--></div> <button>Toggle</button>`);
}