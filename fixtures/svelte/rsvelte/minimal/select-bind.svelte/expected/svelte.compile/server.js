import * as $ from 'svelte/internal/server';

export default function Select_bind($$renderer) {
	let choice = 'b';
	let items = ['a', 'b'];

	$$renderer.select({ value: choice }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.option({}, item);
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` <p>${$.escape(choice)}</p>`);
}