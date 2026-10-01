import * as $ from 'svelte/internal/server';

export default function Select_multiple($$renderer) {
	let flavours = ['mint'];
	const all = ['mint', 'lemon', 'cherry'];

	$$renderer.select({ multiple: true, value: flavours }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(all);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let flavour = each_array[$$index];

			$$renderer.option({ value: flavour }, ($$renderer) => {
				$$renderer.push(`${$.escape(flavour)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` <p>${$.escape(flavours.join(', '))}</p>`);
}