import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";

export default function Calendar_14($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy(new CalendarDate(2025, 6, 12)));
	const bookedDates = Array.from({ length: 12 }, (_, i) => new CalendarDate(2025, 6, 15 + i));

	Calendar($$anchor, {
		type: 'single',
		class: 'rounded-lg border shadow-sm',
		isDateUnavailable: (date) => bookedDates.some((d) => d.compare(date) === 0),
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.pop();
}