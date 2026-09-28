import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

export default function Calendar_05($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 6, 12),
		end: new CalendarDate(2025, 7, 15)
	}));

	RangeCalendar($$anchor, {
		class: 'rounded-lg border shadow-sm',
		numberOfMonths: 2,
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.pop();
}