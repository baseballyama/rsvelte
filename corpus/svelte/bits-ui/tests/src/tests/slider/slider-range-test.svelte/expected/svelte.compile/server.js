import * as $ from 'svelte/internal/server';
import { Slider } from "bits-ui";

export default function Slider_range_test($$renderer, $$props) {
	let { value = [20, 80], $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main>`);

		{
			function children($$renderer, { thumbItems, tickItems }) {
				$$renderer.push(`<span class="bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full">`);

				if (Slider.Range) {
					$$renderer.push('<!--[-->');
					Slider.Range($$renderer, { 'data-testid': 'range', class: 'bg-primary absolute h-full' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</span> <!--[-->`);

				const each_array = $.ensure_array_like(thumbItems);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let { index } = each_array[i];

					if (Slider.Thumb) {
						$$renderer.push('<!--[-->');

						Slider.Thumb($$renderer, {
							index,
							'aria-label': 'Volume',
							'data-testid': `thumb-${$.stringify(i)}`,
							class: 'border-primary/50 focus-visible:ring-ring bg-background block h-4 w-4 rounded-full border shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array_1 = $.ensure_array_like(tickItems);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let { index } = each_array_1[$$index_1];

					if (Slider.Tick) {
						$$renderer.push('<!--[-->');
						Slider.Tick($$renderer, { 'data-testid': 'tick', index });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			}

			if (Slider.Root) {
				$$renderer.push('<!--[-->');

				Slider.Root($$renderer, $.spread_props([
					{ type: 'multiple', 'data-testid': 'root' },
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

		$$renderer.push(`</main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}