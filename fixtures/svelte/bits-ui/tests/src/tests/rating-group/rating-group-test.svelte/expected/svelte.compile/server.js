import * as $ from 'svelte/internal/server';
import { RatingGroup } from "bits-ui";

export default function Rating_group_test($$renderer, $$props) {
	let { value = 0, max = 5, $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main>`);

		{
			function children($$renderer, { items }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					if (RatingGroup.Item) {
						$$renderer.push('<!--[-->');

						RatingGroup.Item($$renderer, {
							index: item.index,
							'data-testid': `item-${$.stringify(item.index)}`,
							class: 'rating-item h-10 w-10',
							children: ($$renderer) => {
								$$renderer.push(`<span${$.attr('data-testid', `star-${$.stringify(item.index)}`)}>★</span> <span${$.attr('data-testid', `state-${$.stringify(item.index)}`)}>${$.escape(item.state)}</span>`);
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
			}

			if (RatingGroup.Root) {
				$$renderer.push('<!--[-->');

				RatingGroup.Root($$renderer, $.spread_props([
					{ 'data-testid': 'root', max },
					restProps,
					{
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(` <div data-testid="value-display">${$.escape(value)}</div> <button data-testid="reset-button">Reset</button> <button data-testid="set-half-button">Set 2.5</button></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}