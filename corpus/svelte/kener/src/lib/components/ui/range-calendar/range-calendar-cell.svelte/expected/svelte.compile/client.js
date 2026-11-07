import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Range_calendar_cell($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("dark:[&:has([data-range-start])]:hover:bg-accent dark:[&:has([data-range-end])]:hover:bg-accent [&:has([data-range-middle])]:bg-accent dark:[&:has([data-range-middle])]:hover:bg-accent/50 [&:has([data-selected])]:bg-accent relative size-(--cell-size) p-0 text-center text-sm focus-within:z-20 data-[range-middle]:rounded-e-md [&:first-child[data-selected]_[data-bits-day]]:rounded-s-md [&:has([data-range-end])]:rounded-e-md [&:has([data-range-middle])]:rounded-none first:[&:has([data-range-middle])]:rounded-s-md last:[&:has([data-range-middle])]:rounded-e-md [&:has([data-range-start])]:rounded-s-md [&:last-child[data-selected]_[data-bits-day]]:rounded-e-md", $$props.class));

		$.component(node, () => RangeCalendarPrimitive.Cell, ($$anchor, RangeCalendarPrimitive_Cell) => {
			RangeCalendarPrimitive_Cell($$anchor, $.spread_props(
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