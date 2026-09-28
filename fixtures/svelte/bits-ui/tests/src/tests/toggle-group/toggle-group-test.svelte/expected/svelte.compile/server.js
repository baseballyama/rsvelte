import * as $ from 'svelte/internal/server';
import { ToggleGroup } from "bits-ui";

export default function Toggle_group_test($$renderer, $$props) {
	let { value = "", items, $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><button data-testid="binding" aria-label="binding">${$.escape(value)}</button> `);

		if (ToggleGroup.Root) {
			$$renderer.push('<!--[-->');

			ToggleGroup.Root($$renderer, $.spread_props([
				{ 'data-testid': 'root' },
				restProps,
				{
					type: 'single',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { value, disabled } = each_array[$$index];

							if (ToggleGroup.Item) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Item($$renderer, {
									value,
									disabled,
									'data-testid': `item-${$.stringify(value)}`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(value)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}