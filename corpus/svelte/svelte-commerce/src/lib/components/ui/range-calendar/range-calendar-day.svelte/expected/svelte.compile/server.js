import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import { buttonVariants } from '$lib/components/ui/button';
import { cn } from '$lib/core/utils';

export default function Range_calendar_day($$renderer, $$props) {
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
			if (RangeCalendarPrimitive.Day) {
				$$renderer.push('<!--[-->');

				RangeCalendarPrimitive.Day($$renderer, $.spread_props([
					{
						class: cn(buttonVariants({ variant: 'ghost' }), 'size-8 p-0 font-normal data-[selected]:opacity-100', '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground', 'data-[selection-start]:bg-primary data-[selection-start]:text-primary-foreground data-[selection-start]:hover:bg-primary data-[selection-start]:hover:text-primary-foreground data-[selection-start]:focus:bg-primary data-[selection-start]:focus:text-primary-foreground', 'data-[selection-end]:bg-primary data-[selection-end]:text-primary-foreground data-[selection-end]:hover:bg-primary data-[selection-end]:hover:text-primary-foreground data-[selection-end]:focus:bg-primary data-[selection-end]:focus:text-primary-foreground', 'data-[outside-month]:pointer-events-none data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground [&[data-outside-month][data-selected]]:opacity-30', 'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50', 'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through', className)
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
		$.bind_props($$props, { ref, class: className });
	});
}