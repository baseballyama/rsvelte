import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import { ChevronRight } from '@lucide/svelte';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import { cn } from '$lib/core/utils';

function Fallback($$renderer) {
	ChevronRight($$renderer, {});
}

export default function Range_calendar_next_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (RangeCalendarPrimitive.NextButton) {
				$$renderer.push('<!--[-->');

				RangeCalendarPrimitive.NextButton($$renderer, $.spread_props([
					{
						class: cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100', className)
					},
					restProps,
					{
						children: children || Fallback,
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