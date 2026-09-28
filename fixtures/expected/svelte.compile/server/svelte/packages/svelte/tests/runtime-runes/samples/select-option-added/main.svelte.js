import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let options = [1, 2, 3];
	let selected = 1;

	$$renderer.push(`<button>add option</button> <p>selected: ${$.escape(selected)}</p> `);

	$$renderer.select({ value: selected }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let o = each_array[$$index];

			$$renderer.option({}, o);
		}

		$$renderer.push(`<!--]-->`);
	});
}