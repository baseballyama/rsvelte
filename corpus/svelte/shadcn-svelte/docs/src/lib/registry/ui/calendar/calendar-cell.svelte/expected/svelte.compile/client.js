import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar as CalendarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Calendar_cell($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("relative size-(--cell-size) p-0 text-center text-sm focus-within:z-20 [&:first-child[data-selected]_[data-bits-day]]:rounded-s-(--cell-radius) [&:last-child[data-selected]_[data-bits-day]]:rounded-e-(--cell-radius)", $$props.class));

		$.component(node, () => CalendarPrimitive.Cell, ($$anchor, CalendarPrimitive_Cell) => {
			CalendarPrimitive_Cell($$anchor, $.spread_props(
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