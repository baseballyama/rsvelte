import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

var root = $.from_html(`<div class="flex min-w-0 flex-col gap-2"><!> <div class="text-center text-xs text-muted-foreground">Your stay must be between 2 and 20 nights</div></div>`);

export default function Calendar_07($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 6, 18),
		end: new CalendarDate(2025, 7, 7)
	}));

	var div = root();
	var node = $.child(div);

	RangeCalendar(node, {
		minDays: 2,
		maxDays: 20,
		numberOfMonths: 2,
		class: 'rounded-lg border shadow-sm',
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