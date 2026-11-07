import * as $ from 'svelte/internal/server';
import { Slider } from "bits-ui";

export default function Slider_test_with_labels($$renderer, $$props) {
	let {
		value = [30],
		min = 0,
		max = 100,
		step = 1,
		tickLabelPosition,
		thumbLabelPosition,
		showTickLabels = true,
		showThumbLabels = true,
		orientation = "horizontal",
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main>`);

		{
			function children($$renderer, { thumbItems, tickItems }) {
				$$renderer.push(`<span>`);

				if (Slider.Range) {
					$$renderer.push('<!--[-->');
					Slider.Range($$renderer, { 'data-testid': 'range' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</span> <!--[-->`);

				const each_array = $.ensure_array_like(thumbItems);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { index, value: thumbValue } = each_array[$$index];

					if (Slider.Thumb) {
						$$renderer.push('<!--[-->');

						Slider.Thumb($$renderer, {
							index,
							'aria-label': 'slider thumb',
							'data-testid': `thumb-${$.stringify(index)}`
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (showThumbLabels) {
						$$renderer.push('<!--[0-->');

						if (Slider.ThumbLabel) {
							$$renderer.push('<!--[-->');

							Slider.ThumbLabel($$renderer, {
								index,
								'data-testid': `thumb-label-${$.stringify(index)}`,
								position: thumbLabelPosition,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(thumbValue)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array_1 = $.ensure_array_like(tickItems);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let { index, value: tickValue } = each_array_1[$$index_1];

					if (Slider.Tick) {
						$$renderer.push('<!--[-->');
						Slider.Tick($$renderer, { 'data-testid': `tick-${$.stringify(index)}`, index });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (showTickLabels) {
						$$renderer.push('<!--[0-->');

						if (Slider.TickLabel) {
							$$renderer.push('<!--[-->');

							Slider.TickLabel($$renderer, {
								index,
								'data-testid': `tick-label-${$.stringify(index)}`,
								position: tickLabelPosition,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tickValue)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			if (Slider.Root) {
				$$renderer.push('<!--[-->');

				Slider.Root($$renderer, $.spread_props([
					{ type: 'multiple', 'data-testid': 'root', orientation },
					restProps,
					{
						min,
						max,
						step,
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

		$$renderer.push(`</main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}