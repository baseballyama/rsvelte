import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Range_calendar_grid_row($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("flex", $$props.class));

		$.component(node, () => RangeCalendarPrimitive.GridRow, ($$anchor, RangeCalendarPrimitive_GridRow) => {
			RangeCalendarPrimitive_GridRow($$anchor, $.spread_props(
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