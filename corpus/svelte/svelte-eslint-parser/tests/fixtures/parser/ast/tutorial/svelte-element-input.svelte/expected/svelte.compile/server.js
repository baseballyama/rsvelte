import * as $ from 'svelte/internal/server';

export default function Svelte_element_input($$renderer) {
	const options = ['h1', 'h3', 'p'];
	let selected = options[0];

	$$renderer.select({ value: selected }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.option({ value: option }, ($$renderer) => {
				$$renderer.push(`${$.escape(option)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` `);

	$.element($$renderer, selected, void 0, () => {
		$$renderer.push(`I'm a ${$.escape(selected)} tag`);
	});
}