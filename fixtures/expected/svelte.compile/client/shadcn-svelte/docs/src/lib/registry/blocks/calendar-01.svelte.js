import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";

export default function Calendar_01($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy(new CalendarDate(2025, 6, 12)));

	Calendar($$anchor, {
		type: 'single',
		class: 'rounded-lg border shadow-sm',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.pop();
}