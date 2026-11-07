import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";

export default function Calendar_03($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy([new CalendarDate(2025, 6, 12), new CalendarDate(2025, 7, 24)]));

	// svelte-ignore state_referenced_locally
	let placeholder = $.state($.proxy($.get(value)[0]));

	Calendar($$anchor, {
		type: 'multiple',
		maxDays: 5,
		class: 'rounded-lg border shadow-sm',
		numberOfMonths: 2,
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		get placeholder() {
			return $.get(placeholder);
		},

		set placeholder($$value) {
			$.set(placeholder, $$value, true);
		}
	});

	$.pop();
}