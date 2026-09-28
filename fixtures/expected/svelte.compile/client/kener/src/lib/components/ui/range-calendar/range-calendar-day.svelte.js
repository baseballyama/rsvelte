import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Range_calendar_day($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: "ghost" }), "flex size-(--cell-size) flex-col items-center justify-center gap-1 p-0 leading-none font-normal whitespace-nowrap select-none", "[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground [&[data-today][data-disabled]]:text-muted-foreground data-[range-middle]:rounded-none", "data-[range-start]:bg-primary dark:data-[range-start]:hover:bg-accent data-[range-start]:text-primary-foreground", "data-[range-end]:bg-primary dark:data-[range-end]:hover:bg-accent data-[range-end]:text-primary-foreground", "[&[data-outside-month]:not([data-selected])]:text-muted-foreground [&[data-outside-month]:not([data-selected])]:hover:text-accent-foreground", "data-[disabled]:text-muted-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", "data-[unavailable]:line-through", "dark:data-[range-middle]:hover:bg-accent/0", "dark:hover:text-accent-foreground", "focus:border-ring focus:ring-ring/50 focus:relative", "[&>span]:text-xs [&>span]:opacity-70", $$props.class));

		$.component(node, () => RangeCalendarPrimitive.Day, ($$anchor, RangeCalendarPrimitive_Day) => {
			RangeCalendarPrimitive_Day($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}