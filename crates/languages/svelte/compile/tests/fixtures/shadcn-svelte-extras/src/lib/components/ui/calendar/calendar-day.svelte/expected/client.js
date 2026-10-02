import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Calendar as CalendarPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Calendar_day($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex size-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) p-0 leading-none font-normal whitespace-nowrap select-none', '[&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)', 'not-data-selected:hover:bg-accent/50 not-data-selected:hover:text-accent-foreground', '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground [&[data-today][data-disabled]]:text-muted-foreground', 'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:text-foreground', '[&[data-outside-month]:not([data-selected])]:text-muted-foreground [&[data-outside-month]:not([data-selected])]:hover:text-accent-foreground', 'data-[disabled]:text-muted-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', 'data-[unavailable]:text-muted-foreground data-[unavailable]:line-through', 'focus:border-ring focus:ring-ring/50 focus:relative', '[&>span]:text-xs [&>span]:opacity-70', $$props.class));

		$.component(node, () => CalendarPrimitive.Day, ($$anchor, CalendarPrimitive_Day) => {
			CalendarPrimitive_Day($$anchor, $.spread_props(
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