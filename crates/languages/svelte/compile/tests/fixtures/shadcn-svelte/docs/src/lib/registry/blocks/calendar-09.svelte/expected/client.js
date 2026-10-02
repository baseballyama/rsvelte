import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, isWeekend } from "@internationalized/date";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

var root = $.from_html(`<div class="flex min-w-0 flex-col gap-2"><!> <div class="text-center text-xs text-muted-foreground">Your stay cannot extend through the weekend</div></div>`);

export default function Calendar_09($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 6, 17),
		end: new CalendarDate(2025, 6, 20)
	}));

	var div = root();
	var node = $.child(div);

	RangeCalendar(node, {
		numberOfMonths: 2,
		isDateDisabled: (date) => isWeekend(date, "en-US"),
		class: 'rounded-lg border shadow-sm',
		excludeDisabled: true,
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}