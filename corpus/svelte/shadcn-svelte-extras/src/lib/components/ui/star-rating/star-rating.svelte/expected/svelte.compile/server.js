import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { RatingGroup } from 'bits-ui';

export default function Star_rating($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = 0,
			max = 5,
			orientation = 'horizontal',
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (RatingGroup.Root) {
				$$renderer.push('<!--[-->');

				RatingGroup.Root($$renderer, $.spread_props([
					{
						class: cn('group flex w-fit place-items-center gap-1 rounded-md outline-hidden', className),
						max,
						orientation
					},
					rest,
					{
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}