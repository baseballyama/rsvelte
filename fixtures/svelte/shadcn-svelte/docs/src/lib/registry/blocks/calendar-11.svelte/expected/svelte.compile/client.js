import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

var root = $.from_html(`<div class="flex min-w-0 flex-col gap-2"><!> <div class="text-center text-xs text-muted-foreground">We are open in June and July only.</div></div>`);

export default function Calendar_11($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 6, 17),
		end: new CalendarDate(2025, 6, 20)
	}));

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => new CalendarDate(2025, 6, 1));
		let $1 = $.derived(() => new CalendarDate(2025, 7, 31));

		RangeCalendar(node, {
			numberOfMonths: 2,
			get minValue() {
				return $.get($0);
			},

			get maxValue() {
				return $.get($1);
			},
			class: 'rounded-lg border shadow-sm',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			}
		});
	}

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}