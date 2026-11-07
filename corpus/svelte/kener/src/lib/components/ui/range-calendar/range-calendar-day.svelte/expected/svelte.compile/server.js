import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import { cn } from "$lib/utils.js";

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
						class: cn(buttonVariants({ variant: "ghost" }), "flex size-(--cell-size) flex-col items-center justify-center gap-1 p-0 leading-none font-normal whitespace-nowrap select-none", "[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground [&[data-today][data-disabled]]:text-muted-foreground data-[range-middle]:rounded-none", "data-[range-start]:bg-primary dark:data-[range-start]:hover:bg-accent data-[range-start]:text-primary-foreground", "data-[range-end]:bg-primary dark:data-[range-end]:hover:bg-accent data-[range-end]:text-primary-foreground", "[&[data-outside-month]:not([data-selected])]:text-muted-foreground [&[data-outside-month]:not([data-selected])]:hover:text-accent-foreground", "data-[disabled]:text-muted-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", "data-[unavailable]:line-through", "dark:data-[range-middle]:hover:bg-accent/0", "dark:hover:text-accent-foreground", "focus:border-ring focus:ring-ring/50 focus:relative", "[&>span]:text-xs [&>span]:opacity-70", className)
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