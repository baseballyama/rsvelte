import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Calendar as CalendarPrimitive } from 'bits-ui';

export default function Calendar_day($$renderer, $$props) {
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
			if (CalendarPrimitive.Day) {
				$$renderer.push('<!--[-->');

				CalendarPrimitive.Day($$renderer, $.spread_props([
					{
						class: cn('flex size-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) p-0 leading-none font-normal whitespace-nowrap select-none', '[&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)', 'not-data-selected:hover:bg-accent/50 not-data-selected:hover:text-accent-foreground', '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground [&[data-today][data-disabled]]:text-muted-foreground', 'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:text-foreground', '[&[data-outside-month]:not([data-selected])]:text-muted-foreground [&[data-outside-month]:not([data-selected])]:hover:text-accent-foreground', 'data-[disabled]:text-muted-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', 'data-[unavailable]:text-muted-foreground data-[unavailable]:line-through', 'focus:border-ring focus:ring-ring/50 focus:relative', '[&>span]:text-xs [&>span]:opacity-70', className)
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