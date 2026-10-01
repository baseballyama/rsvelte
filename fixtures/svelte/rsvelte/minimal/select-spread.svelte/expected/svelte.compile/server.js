import * as $ from 'svelte/internal/server';

export default function Select_spread($$renderer, $$props) {
	let { options = [], $$slots, $$events, ...rest } = $$props;
	let current = 'x';

	$$renderer.select(
		{ ...rest, class: 'picker', value: current },
		($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(options);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let option = each_array[$$index];

				$$renderer.option(
					{ value: option, class: '' },
					($$renderer) => {
						$$renderer.push(`${$.escape(option)}`);
					},
					'svelte-1rzblzg',
					{ current: option === current }
				);
			}

			$$renderer.push(`<!--]--><optgroup label="more">`);

			$$renderer.option(
				{ ...rest },
				($$renderer) => {
					$$renderer.push(`other`);
				},
				'svelte-1rzblzg'
			);

			$$renderer.push(`</optgroup>`);
		},
		'svelte-1rzblzg'
	);
}