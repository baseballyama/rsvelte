import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLocalTimeZone, today } from "@internationalized/date";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";

export default function Range_calendar_demo($$anchor, $$props) {
	$.push($$props, true);

	const start = today(getLocalTimeZone());
	const end = start.add({ days: 7 });
	let value = $.state($.proxy({ start, end }));

	RangeCalendar($$anchor, {
		class: 'rounded-md border',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.pop();
}