import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

export default function Range_calendar_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (RangeCalendarPrimitive.Header) {
				$$renderer.push('<!--[-->');

				RangeCalendarPrimitive.Header($$renderer, $.spread_props([
					{
						class: cn('relative flex w-full items-center justify-between pt-1', className)
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
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
		$.bind_props($$props, { ref });
	});
}