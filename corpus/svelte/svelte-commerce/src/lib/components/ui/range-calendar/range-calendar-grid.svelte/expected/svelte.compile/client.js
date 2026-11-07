import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Range_calendar_grid($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('w-full border-collapse space-y-1', $$props.class));

		$.component(node, () => RangeCalendarPrimitive.Grid, ($$anchor, RangeCalendarPrimitive_Grid) => {
			RangeCalendarPrimitive_Grid($$anchor, $.spread_props(
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